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
}

func NewRoutineServiceWithTemplates(routineRepo repository.RoutineRepository, templateRepo repository.RoutineTemplateRepository) RoutineService {
	return &routineServiceWithTemplates{
		routineRepo:  routineRepo,
		templateRepo: templateRepo,
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
