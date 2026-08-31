package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/repository"
)

// SuggestionService orquesta el flujo manual de sugerencias de rutina: al
// completar un ciclo arma el prompt (sin llamar a ninguna API, cero costo),
// lo guarda y avisa por push para que el usuario lo copie y se lo pegue a
// Claude a mano; después el usuario pega la respuesta de vuelta en la app.
type SuggestionService interface {
	// CheckAndGenerate se llama después de loguear un entrenamiento. Si ese log
	// fue el que completó el ciclo (y todavía no existe una sugerencia para esta
	// rutina), arma el prompt y manda el push. Pensado para correr en background
	// (goroutine) - no debe bloquear el log del workout.
	CheckAndGenerate(ctx context.Context, userID, routineID int64) error
	GetCurrent(ctx context.Context, userID int64) (*dto.SuggestionStatusResponse, error)
	SubmitAnswer(ctx context.Context, suggestionID int64, rawAnswer string) (*dto.SuggestionStatusResponse, error)
	Apply(ctx context.Context, suggestionID int64) (*domain.Routine, error)
	Dismiss(ctx context.Context, suggestionID int64) error
}

type suggestionService struct {
	suggestionRepo repository.RoutineSuggestionRepository
	routineRepo    repository.RoutineRepository
	workoutRepo    repository.WorkoutRepository
	userRepo       repository.UserRepository
	pushService    PushService
	routineService RoutineService // reutiliza CreateRoutine (deactivate + create) al aplicar
}

func NewSuggestionService(
	suggestionRepo repository.RoutineSuggestionRepository,
	routineRepo repository.RoutineRepository,
	workoutRepo repository.WorkoutRepository,
	userRepo repository.UserRepository,
	pushService PushService,
	routineService RoutineService,
) SuggestionService {
	return &suggestionService{
		suggestionRepo: suggestionRepo,
		routineRepo:    routineRepo,
		workoutRepo:    workoutRepo,
		userRepo:       userRepo,
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
		return nil // ya se generó un prompt para este ciclo, no repetir
	}

	routine, err := s.hydrateRoutine(ctx, routineID)
	if err != nil {
		return fmt.Errorf("error loading routine: %w", err)
	}

	logs, err := s.hydrateHistory(ctx, routineID)
	if err != nil {
		return fmt.Errorf("error loading history: %w", err)
	}

	prompt, err := BuildRoutineAnalysisPrompt(routine, logs)
	if err != nil {
		return fmt.Errorf("error building prompt: %w", err)
	}

	suggestion := &domain.RoutineSuggestion{
		UserID:    userID,
		RoutineID: routineID,
		Prompt:    prompt,
	}
	if err := s.suggestionRepo.CreateAwaitingInput(ctx, suggestion); err != nil {
		return fmt.Errorf("error saving suggestion: %w", err)
	}

	pushToken, err := s.userRepo.GetPushToken(ctx, userID)
	if err == nil && pushToken != "" {
		_ = s.pushService.Send(ctx, pushToken,
			"🎉 Tu ciclo terminó",
			"Abrí la app para pedirle la sugerencia de tu próxima rutina a Claude.",
		)
	}

	return nil
}

func (s *suggestionService) GetCurrent(ctx context.Context, userID int64) (*dto.SuggestionStatusResponse, error) {
	suggestion, err := s.suggestionRepo.GetLatestByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("no suggestion available: %w", err)
	}

	resp := &dto.SuggestionStatusResponse{
		ID:        suggestion.ID,
		Status:    string(suggestion.Status),
		Prompt:    suggestion.Prompt,
		Diagnosis: suggestion.Diagnosis,
		CreatedAt: suggestion.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	if suggestion.Status == domain.SuggestionPending {
		var routineReq dto.CreateRoutineRequest
		if err := json.Unmarshal([]byte(suggestion.SuggestedRoutine), &routineReq); err != nil {
			return nil, fmt.Errorf("error parsing suggested routine: %w", err)
		}
		resp.Routine = &routineReq
	}

	return resp, nil
}

// SubmitAnswer recibe el texto que el usuario pegó de vuelta desde Claude
// (la respuesta al prompt que le copió) y lo valida/guarda como sugerencia lista
// para revisar. El JSON esperado tiene la misma forma que AIRoutineSuggestion.
func (s *suggestionService) SubmitAnswer(ctx context.Context, suggestionID int64, rawAnswer string) (*dto.SuggestionStatusResponse, error) {
	suggestion, err := s.suggestionRepo.GetByID(ctx, suggestionID)
	if err != nil {
		return nil, fmt.Errorf("suggestion not found: %w", err)
	}
	if suggestion.Status != domain.SuggestionAwaitingInput {
		return nil, fmt.Errorf("suggestion is not awaiting input (status: %s)", suggestion.Status)
	}

	var aiResult AIRoutineSuggestion
	if err := json.Unmarshal([]byte(extractJSON(rawAnswer)), &aiResult); err != nil {
		return nil, fmt.Errorf("no pude interpretar la respuesta pegada - ¿es el JSON completo que devolvió Claude?: %w", err)
	}
	if aiResult.Name == "" || len(aiResult.Days) == 0 {
		return nil, fmt.Errorf("la respuesta pegada no tiene el formato esperado (falta name o days)")
	}

	routine, err := s.routineRepo.GetByID(ctx, suggestion.RoutineID)
	if err != nil {
		return nil, fmt.Errorf("error loading routine: %w", err)
	}

	createReq := aiSuggestionToCreateRequest(suggestion.UserID, routine, &aiResult)
	routineJSON, err := json.Marshal(createReq)
	if err != nil {
		return nil, fmt.Errorf("error marshaling suggested routine: %w", err)
	}

	if err := s.suggestionRepo.SubmitAnswer(ctx, suggestionID, aiResult.Diagnosis, string(routineJSON)); err != nil {
		return nil, fmt.Errorf("error saving answer: %w", err)
	}

	return s.GetCurrent(ctx, suggestion.UserID)
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

// hydrateRoutine carga la rutina completa (días + ejercicios) para el prompt.
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
// que el prompt tenga el progreso real (pesos, reps, RIR) sesión por sesión.
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

// extractJSON tolera que el usuario pegue el JSON envuelto en ```json ... ```
// (algo común al copiar la respuesta de Claude) recortando todo lo que no sea
// el objeto { ... } en sí.
func extractJSON(raw string) string {
	start := -1
	end := -1
	for i, c := range raw {
		if c == '{' && start == -1 {
			start = i
		}
		if c == '}' {
			end = i
		}
	}
	if start == -1 || end == -1 || end < start {
		return raw
	}
	return raw[start : end+1]
}
