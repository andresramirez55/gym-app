package service

import (
	"context"
	"fmt"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/repository"
)

type RoutineService interface {
	GenerateRoutineForUser(ctx context.Context, req *dto.GenerateRoutineRequest) (*domain.Routine, error)
	GetRoutineByID(ctx context.Context, id int64) (*domain.Routine, error)
	GetActiveRoutineByUserID(ctx context.Context, userID int64) (*domain.Routine, error)
	UpdateExercise(ctx context.Context, exercise *domain.Exercise) error
}

type routineService struct {
	routineRepo repository.RoutineRepository
	aiService   AIService
}

func NewRoutineService(routineRepo repository.RoutineRepository, aiService AIService) RoutineService {
	return &routineService{
		routineRepo: routineRepo,
		aiService:   aiService,
	}
}

func (s *routineService) GenerateRoutineForUser(ctx context.Context, req *dto.GenerateRoutineRequest) (*domain.Routine, error) {
	// Generate routine using AI
	aiRoutine, err := s.aiService.GenerateRoutine(ctx, req.Goal, req.Frequency)
	if err != nil {
		return nil, fmt.Errorf("error generating routine with AI: %w", err)
	}

	// Deactivate existing routines for this user
	if err := s.routineRepo.DeactivateUserRoutines(ctx, req.UserID); err != nil {
		return nil, fmt.Errorf("error deactivating old routines: %w", err)
	}

	// Create routine
	routine := &domain.Routine{
		UserID:      req.UserID,
		Name:        aiRoutine.Name,
		Description: aiRoutine.Description,
		Goal:        req.Goal,
		Frequency:   req.Frequency,
		IsActive:    true,
	}

	if err := s.routineRepo.Create(ctx, routine); err != nil {
		return nil, fmt.Errorf("error creating routine: %w", err)
	}

	// Create days and exercises
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

	// Load full routine with days and exercises
	return s.GetRoutineByID(ctx, routine.ID)
}

func (s *routineService) GetRoutineByID(ctx context.Context, id int64) (*domain.Routine, error) {
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

func (s *routineService) GetActiveRoutineByUserID(ctx context.Context, userID int64) (*domain.Routine, error) {
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

func (s *routineService) UpdateExercise(ctx context.Context, exercise *domain.Exercise) error {
	return s.routineRepo.UpdateExercise(ctx, exercise)
}
