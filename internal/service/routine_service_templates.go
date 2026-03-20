package service

import (
	"context"
	"fmt"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/repository"
)

type routineServiceWithTemplates struct {
	routineRepo  repository.RoutineRepository
	templateRepo repository.RoutineTemplateRepository
	workoutRepo  repository.WorkoutRepository
	aiService    AIService
}

func NewRoutineServiceWithTemplates(routineRepo repository.RoutineRepository, templateRepo repository.RoutineTemplateRepository, workoutRepo repository.WorkoutRepository, aiService AIService) RoutineService {
	return &routineServiceWithTemplates{
		routineRepo:  routineRepo,
		templateRepo: templateRepo,
		workoutRepo:  workoutRepo,
		aiService:    aiService,
	}
}

func (s *routineServiceWithTemplates) GenerateRoutineForUser(ctx context.Context, req *dto.GenerateRoutineRequest) (*domain.Routine, error) {
	// Obtener template aleatorio según objetivo y frecuencia
	template, err := s.templateRepo.GetRandomTemplate(ctx, string(req.Goal), int(req.Frequency))
	if err != nil {
		return nil, fmt.Errorf("no template found for goal=%s frequency=%d: %w", req.Goal, req.Frequency, err)
	}

	// Desactivar rutinas existentes del usuario
	if err := s.routineRepo.DeactivateUserRoutines(ctx, req.UserID); err != nil {
		return nil, fmt.Errorf("error deactivating old routines: %w", err)
	}

	// Crear rutina basada en el template
	routine := &domain.Routine{
		UserID:      req.UserID,
		Name:        template.Name,
		Description: template.Description,
		Goal:        req.Goal,
		Frequency:   req.Frequency,
		IsActive:    true,
	}

	if err := s.routineRepo.Create(ctx, routine); err != nil {
		return nil, fmt.Errorf("error creating routine: %w", err)
	}

	// Obtener días del template
	templateDays, err := s.templateRepo.GetTemplateDays(ctx, template.ID)
	if err != nil {
		return nil, fmt.Errorf("error loading template days: %w", err)
	}

	// Crear días y ejercicios
	for _, templateDay := range templateDays {
		day := &domain.RoutineDay{
			RoutineID: routine.ID,
			DayNumber: templateDay.DayNumber,
			DayName:   templateDay.DayName,
		}

		if err := s.routineRepo.CreateDay(ctx, day); err != nil {
			return nil, fmt.Errorf("error creating routine day: %w", err)
		}

		// Obtener ejercicios del template
		templateExercises, err := s.templateRepo.GetTemplateExercises(ctx, templateDay.ID)
		if err != nil {
			return nil, fmt.Errorf("error loading template exercises: %w", err)
		}

		// Crear ejercicios
		for _, templateEx := range templateExercises {
			exercise := &domain.Exercise{
				RoutineDayID: day.ID,
				Name:         templateEx.Name,
				Sets:         templateEx.Sets,
				Reps:         fmt.Sprintf("%d", templateEx.Reps),
				RestSeconds:  templateEx.RestSeconds,
				Order:        templateEx.Order,
				Notes:        templateEx.Notes,
			}

			if err := s.routineRepo.CreateExercise(ctx, exercise); err != nil {
				return nil, fmt.Errorf("error creating exercise: %w", err)
			}
		}
	}

	// Cargar rutina completa con días y ejercicios
	return s.GetRoutineByID(ctx, routine.ID)
}

func (s *routineServiceWithTemplates) CreateRoutine(ctx context.Context, req *dto.CreateRoutineRequest) (*domain.Routine, error) {
	// Desactivar rutinas existentes del usuario
	if err := s.routineRepo.DeactivateUserRoutines(ctx, req.UserID); err != nil {
		return nil, fmt.Errorf("error deactivating old routines: %w", err)
	}

	// Crear rutina
	routine := &domain.Routine{
		UserID:        req.UserID,
		Name:          req.Name,
		Description:   fmt.Sprintf("Rutina personalizada de %d días", req.Frequency),
		Goal:          req.Goal,
		Frequency:     req.Frequency,
		DurationWeeks: req.DurationWeeks,
		IsActive:      true,
	}

	if err := s.routineRepo.Create(ctx, routine); err != nil {
		return nil, fmt.Errorf("error creating routine: %w", err)
	}

	// Crear días y ejercicios
	for dayIdx, reqDay := range req.Days {
		day := &domain.RoutineDay{
			RoutineID: routine.ID,
			DayNumber: dayIdx + 1,
			DayName:   reqDay.DayName,
		}

		if err := s.routineRepo.CreateDay(ctx, day); err != nil {
			return nil, fmt.Errorf("error creating routine day: %w", err)
		}

		for exIdx, reqEx := range reqDay.Exercises {
			exercise := &domain.Exercise{
				RoutineDayID: day.ID,
				Name:         reqEx.Name,
				Sets:         reqEx.Sets,
				Reps:         reqEx.Reps,
				RestSeconds:  reqEx.RestSeconds,
				Order:        exIdx + 1,
				Notes:        reqEx.Notes,
			}

			if err := s.routineRepo.CreateExercise(ctx, exercise); err != nil {
				return nil, fmt.Errorf("error creating exercise: %w", err)
			}
		}
	}

	// Cargar rutina completa con días y ejercicios
	return s.GetRoutineByID(ctx, routine.ID)
}

func (s *routineServiceWithTemplates) ImportRoutine(ctx context.Context, req *dto.ImportRoutineRequest) (*domain.Routine, error) {
	// Check if AI service is available
	if s.aiService == nil {
		return nil, fmt.Errorf("AI service not configured. Set CLAUDE_API_KEY environment variable to use this feature.")
	}

	// Parse routine text using AI
	aiRoutine, err := s.aiService.ParseRoutineText(ctx, req.Text)
	if err != nil {
		return nil, fmt.Errorf("error parsing routine text: %w", err)
	}

	// Desactivar rutinas existentes del usuario
	if err := s.routineRepo.DeactivateUserRoutines(ctx, req.UserID); err != nil {
		return nil, fmt.Errorf("error deactivating old routines: %w", err)
	}

	// Crear rutina
	routine := &domain.Routine{
		UserID:        req.UserID,
		Name:          aiRoutine.Name,
		Description:   aiRoutine.Description,
		Goal:          req.Goal,
		Frequency:     req.Frequency,
		DurationWeeks: req.DurationWeeks,
		IsActive:      true,
	}

	if err := s.routineRepo.Create(ctx, routine); err != nil {
		return nil, fmt.Errorf("error creating routine: %w", err)
	}

	// Crear días y ejercicios
	for _, aiDay := range aiRoutine.Days {
		day := &domain.RoutineDay{
			RoutineID: routine.ID,
			DayNumber: aiDay.DayNumber,
			DayName:   aiDay.DayName,
		}

		if err := s.routineRepo.CreateDay(ctx, day); err != nil {
			return nil, fmt.Errorf("error creating routine day: %w", err)
		}

		for i, aiEx := range aiDay.Exercises {
			exercise := &domain.Exercise{
				RoutineDayID: day.ID,
				Name:         aiEx.Name,
				Sets:         aiEx.Sets,
				Reps:         aiEx.Reps,
				RestSeconds:  aiEx.RestSeconds,
				Order:        i + 1,
				Notes:        aiEx.Notes,
			}

			if err := s.routineRepo.CreateExercise(ctx, exercise); err != nil {
				return nil, fmt.Errorf("error creating exercise: %w", err)
			}
		}
	}

	// Cargar rutina completa con días y ejercicios
	return s.GetRoutineByID(ctx, routine.ID)
}

func (s *routineServiceWithTemplates) GetRoutineByID(ctx context.Context, id int64) (*domain.Routine, error) {
	routine, err := s.routineRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("routine not found: %w", err)
	}

	// Load days
	days, err := s.routineRepo.GetDaysByRoutineID(ctx, routine.ID)
	if err != nil {
		return nil, fmt.Errorf("error loading routine days: %w", err)
	}

	// Load exercises for each day
	for i := range days {
		exercises, err := s.routineRepo.GetExercisesByDayID(ctx, days[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error loading exercises: %w", err)
		}
		days[i].Exercises = exercises
	}

	routine.Days = days
	return routine, nil
}

func (s *routineServiceWithTemplates) GetActiveRoutineByUserID(ctx context.Context, userID int64) (*domain.Routine, error) {
	routine, err := s.routineRepo.GetActiveByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("no active routine found: %w", err)
	}

	// Count workouts completed for this routine
	workoutCount, err := s.workoutRepo.CountWorkoutsByRoutineID(ctx, routine.ID)
	if err != nil {
		// If error counting, default to 0 workouts
		workoutCount = 0
	}

	// Calculate week based on workouts completed
	// weekNumber = (workouts / frequency) + 1
	// Example: frequency=3, completed 5 workouts → week 2 (5/3 = 1, +1 = 2)
	frequency := int(routine.Frequency)
	if frequency == 0 {
		frequency = 1 // Safety check
	}

	weekNumber := (workoutCount / frequency) + 1
	if weekNumber > routine.DurationWeeks {
		weekNumber = routine.DurationWeeks
	}

	// Calculate workouts remaining in current week
	workoutsInCurrentWeek := workoutCount % frequency
	workoutsRemainingInWeek := frequency - workoutsInCurrentWeek

	routine.WeekNumber = weekNumber
	routine.DaysRemaining = workoutsRemainingInWeek

	// Load days
	days, err := s.routineRepo.GetDaysByRoutineID(ctx, routine.ID)
	if err != nil {
		return nil, fmt.Errorf("error loading routine days: %w", err)
	}

	// Load exercises for each day
	for i := range days {
		exercises, err := s.routineRepo.GetExercisesByDayID(ctx, days[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error loading exercises: %w", err)
		}
		days[i].Exercises = exercises
	}

	routine.Days = days
	return routine, nil
}
func (s *routineServiceWithTemplates) UpdateExercise(ctx context.Context, exercise *domain.Exercise) error {
	return s.routineRepo.UpdateExercise(ctx, exercise)
}
