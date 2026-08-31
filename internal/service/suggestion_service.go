package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/repository"
)

// SuggestionService orquesta el ciclo de vida de las sugerencias de rutina que
// genera Claude cuando un usuario completa su bloque de entrenamiento.
type SuggestionService interface {
	// CheckAndGenerate se llama después de loguear un entrenamiento. Si ese log
	// fue el que completó el ciclo (y todavía no existe una sugerencia para esta
	// rutina), consulta a Claude, guarda la propuesta y manda el push. Pensado
	// para correr en background (goroutine) - no debe bloquear el log del workout.
	CheckAndGenerate(ctx context.Context, userID, routineID int64) error
	GetPending(ctx context.Context, userID int64) (*dto.RoutineSuggestionResponse, error)
	Apply(ctx context.Context, suggestionID int64) (*domain.Routine, error)
	Dismiss(ctx context.Context, suggestionID int64) error
}

type suggestionService struct {
	suggestionRepo repository.RoutineSuggestionRepository
	routineRepo    repository.RoutineRepository
	workoutRepo    repository.WorkoutRepository
	userRepo       repository.UserRepository
	aiService      AIService
	pushService    PushService
	routineService RoutineService // reutiliza CreateRoutine (deactivate + create) al aplicar
}

func NewSuggestionService(
	suggestionRepo repository.RoutineSuggestionRepository,
	routineRepo repository.RoutineRepository,
	workoutRepo repository.WorkoutRepository,
	userRepo repository.UserRepository,
	aiService AIService,
	pushService PushService,
	routineService RoutineService,
) SuggestionService {
	return &suggestionService{
		suggestionRepo: suggestionRepo,
		routineRepo:    routineRepo,
		workoutRepo:    workoutRepo,
		userRepo:       userRepo,
		aiService:      aiService,
		pushService:    pushService,
		routineService: routineService,
	}
}

func (s *suggestionService) CheckAndGenerate(ctx context.Context, userID, routineID int64) error {
	exists, err := s.suggestionRepo.ExistsForRoutine(ctx, routineID)
	if err != nil {
		return fmt.Errorf("error checking existing suggestion: %w", err)
	}
	if exists {
		return nil // ya se generó una para este ciclo, no repetir la consulta
	}

	routine, err := s.hydrateRoutine(ctx, routineID)
	if err != nil {
		return fmt.Errorf("error loading routine: %w", err)
	}

	logs, err := s.hydrateHistory(ctx, routineID)
	if err != nil {
		return fmt.Errorf("error loading history: %w", err)
	}

	aiResult, err := s.aiService.AnalyzeRoutineCompletion(ctx, routine, logs)
	if err != nil {
		return fmt.Errorf("error consulting Claude: %w", err)
	}

	createReq := aiSuggestionToCreateRequest(userID, routine, aiResult)
	routineJSON, err := json.Marshal(createReq)
	if err != nil {
		return fmt.Errorf("error marshaling suggested routine: %w", err)
	}

	suggestion := &domain.RoutineSuggestion{
		UserID:           userID,
		RoutineID:        routineID,
		Diagnosis:        aiResult.Diagnosis,
		SuggestedRoutine: string(routineJSON),
		Status:           domain.SuggestionPending,
	}
	if err := s.suggestionRepo.Create(ctx, suggestion); err != nil {
		return fmt.Errorf("error saving suggestion: %w", err)
	}

	pushToken, err := s.userRepo.GetPushToken(ctx, userID)
	if err == nil && pushToken != "" {
		_ = s.pushService.Send(ctx, pushToken,
			"🎉 Tu ciclo terminó",
			"Claude armó una sugerencia para tu próxima rutina. Abrí la app para verla.",
		)
	}

	return nil
}

func (s *suggestionService) GetPending(ctx context.Context, userID int64) (*dto.RoutineSuggestionResponse, error) {
	suggestion, err := s.suggestionRepo.GetPendingByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("no pending suggestion: %w", err)
	}

	var routineReq dto.CreateRoutineRequest
	if err := json.Unmarshal([]byte(suggestion.SuggestedRoutine), &routineReq); err != nil {
		return nil, fmt.Errorf("error parsing suggested routine: %w", err)
	}

	return &dto.RoutineSuggestionResponse{
		ID:        suggestion.ID,
		RoutineID: suggestion.RoutineID,
		Diagnosis: suggestion.Diagnosis,
		Routine:   routineReq,
		CreatedAt: suggestion.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *suggestionService) Apply(ctx context.Context, suggestionID int64) (*domain.Routine, error) {
	suggestion, err := s.suggestionRepo.GetByID(ctx, suggestionID)
	if err != nil {
		return nil, fmt.Errorf("suggestion not found: %w", err)
	}
	if suggestion.Status != domain.SuggestionPending {
		return nil, fmt.Errorf("suggestion is not pending (status: %s)", suggestion.Status)
	}

	var routineReq dto.CreateRoutineRequest
	if err := json.Unmarshal([]byte(suggestion.SuggestedRoutine), &routineReq); err != nil {
		return nil, fmt.Errorf("error parsing suggested routine: %w", err)
	}

	routine, err := s.routineService.CreateRoutine(ctx, &routineReq)
	if err != nil {
		return nil, fmt.Errorf("error applying suggestion: %w", err)
	}

	if err := s.suggestionRepo.UpdateStatus(ctx, suggestionID, domain.SuggestionApplied); err != nil {
		return nil, fmt.Errorf("error updating suggestion status: %w", err)
	}

	return routine, nil
}

func (s *suggestionService) Dismiss(ctx context.Context, suggestionID int64) error {
	return s.suggestionRepo.UpdateStatus(ctx, suggestionID, domain.SuggestionDismissed)
}

// hydrateRoutine carga la rutina completa (días + ejercicios) para dársela a Claude.
func (s *suggestionService) hydrateRoutine(ctx context.Context, routineID int64) (*domain.Routine, error) {
	routine, err := s.routineRepo.GetByID(ctx, routineID)
	if err != nil {
		return nil, err
	}

	days, err := s.routineRepo.GetDaysByRoutineID(ctx, routineID)
	if err != nil {
		return nil, err
	}
	for i := range days {
		exercises, err := s.routineRepo.GetExercisesByDayID(ctx, days[i].ID)
		if err != nil {
			return nil, err
		}
		days[i].Exercises = exercises
	}
	routine.Days = days
	return routine, nil
}

// hydrateHistory carga todos los workout_logs del ciclo, con sus series, para
// que Claude vea el progreso real (pesos, reps, RIR) sesión por sesión.
func (s *suggestionService) hydrateHistory(ctx context.Context, routineID int64) ([]domain.WorkoutLog, error) {
	logs, err := s.workoutRepo.GetWorkoutLogsByRoutineID(ctx, routineID)
	if err != nil {
		return nil, err
	}

	for i := range logs {
		exLogs, err := s.workoutRepo.GetExerciseLogsByWorkoutID(ctx, logs[i].ID)
		if err != nil {
			return nil, err
		}
		for j := range exLogs {
			sets, err := s.workoutRepo.GetSetLogsByExerciseLogID(ctx, exLogs[j].ID)
			if err != nil {
				return nil, err
			}
			exLogs[j].Sets = sets
		}
		logs[i].ExerciseLogs = exLogs
	}

	return logs, nil
}

func aiSuggestionToCreateRequest(userID int64, currentRoutine *domain.Routine, ai *AIRoutineSuggestion) *dto.CreateRoutineRequest {
	days := make([]dto.CreateDayRequest, len(ai.Days))
	for i, d := range ai.Days {
		exercises := make([]dto.CreateExerciseRequest, len(d.Exercises))
		for j, e := range d.Exercises {
			exercises[j] = dto.CreateExerciseRequest{
				Name:        e.Name,
				Sets:        e.Sets,
				Reps:        e.Reps,
				RestSeconds: e.RestSeconds,
				Notes:       e.Notes,
			}
		}
		days[i] = dto.CreateDayRequest{
			DayName:   d.DayName,
			Exercises: exercises,
		}
	}

	durationWeeks := ai.DurationWeeks
	if durationWeeks <= 0 {
		durationWeeks = currentRoutine.DurationWeeks
	}

	return &dto.CreateRoutineRequest{
		UserID:        userID,
		Name:          ai.Name,
		Goal:          currentRoutine.Goal,
		DurationWeeks: durationWeeks,
		Frequency:     currentRoutine.Frequency,
		Days:          days,
	}
}
