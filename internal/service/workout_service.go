package service

import (
	"context"
	"fmt"
	"time"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/repository"
)

type WorkoutService interface {
	LogWorkout(ctx context.Context, req *dto.LogWorkoutRequest) (*domain.WorkoutLog, error)
	GetWorkoutHistory(ctx context.Context, userID int64, limit int) ([]domain.WorkoutLog, error)
	GetWeightProgress(ctx context.Context, userID, exerciseID int64) (*dto.WeightProgressResponse, error)
	DeleteWorkoutLog(ctx context.Context, id, userID int64) error
	DeleteAllWorkoutLogs(ctx context.Context, userID int64) error
}

type workoutService struct {
	workoutRepo  repository.WorkoutRepository
	routineRepo  repository.RoutineRepository
}

func NewWorkoutService(workoutRepo repository.WorkoutRepository, routineRepo repository.RoutineRepository) WorkoutService {
	return &workoutService{
		workoutRepo:  workoutRepo,
		routineRepo:  routineRepo,
	}
}

func (s *workoutService) LogWorkout(ctx context.Context, req *dto.LogWorkoutRequest) (*domain.WorkoutLog, error) {
	// Create workout log
	workoutLog := &domain.WorkoutLog{
		UserID:       req.UserID,
		RoutineID:    req.RoutineID,
		RoutineDayID: req.RoutineDayID,
		CompletedAt:  time.Now(),
		Duration:     req.Duration,
		Notes:        req.Notes,
	}

	if err := s.workoutRepo.CreateWorkoutLog(ctx, workoutLog); err != nil {
		return nil, fmt.Errorf("error creating workout log: %w", err)
	}

	// Get exercises to get their names
	exercises, err := s.routineRepo.GetExercisesByDayID(ctx, req.RoutineDayID)
	if err != nil {
		return nil, fmt.Errorf("error loading exercises: %w", err)
	}

	exerciseMap := make(map[int64]string)
	for _, ex := range exercises {
		exerciseMap[ex.ID] = ex.Name
	}

	// Create exercise logs and set logs
	for _, exLog := range req.ExerciseLogs {
		exerciseLog := &domain.ExerciseLog{
			WorkoutLogID:  workoutLog.ID,
			ExerciseID:    exLog.ExerciseID,
			ExerciseName:  exerciseMap[exLog.ExerciseID],
			SetsCompleted: len(exLog.Sets),
		}

		if err := s.workoutRepo.CreateExerciseLog(ctx, exerciseLog); err != nil {
			return nil, fmt.Errorf("error creating exercise log: %w", err)
		}

		for _, set := range exLog.Sets {
			setLog := &domain.SetLog{
				ExerciseLogID: exerciseLog.ID,
				SetNumber:     set.SetNumber,
				Weight:        set.Weight,
				Reps:          set.Reps,
			}

			if err := s.workoutRepo.CreateSetLog(ctx, setLog); err != nil {
				return nil, fmt.Errorf("error creating set log: %w", err)
			}
		}
	}

	return workoutLog, nil
}

func (s *workoutService) GetWorkoutHistory(ctx context.Context, userID int64, limit int) ([]domain.WorkoutLog, error) {
	logs, err := s.workoutRepo.GetWorkoutLogsByUserID(ctx, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("error getting workout history: %w", err)
	}

	// Load exercise logs for each workout
	for i := range logs {
		exLogs, err := s.workoutRepo.GetExerciseLogsByWorkoutID(ctx, logs[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error loading exercise logs: %w", err)
		}

		// Load sets for each exercise log
		for j := range exLogs {
			sets, err := s.workoutRepo.GetSetLogsByExerciseLogID(ctx, exLogs[j].ID)
			if err != nil {
				return nil, fmt.Errorf("error loading set logs: %w", err)
			}
			exLogs[j].Sets = sets
		}

		logs[i].ExerciseLogs = exLogs
	}

	return logs, nil
}

func (s *workoutService) GetWeightProgress(ctx context.Context, userID, exerciseID int64) (*dto.WeightProgressResponse, error) {
	history, err := s.workoutRepo.GetWeightHistoryByExercise(ctx, userID, exerciseID)
	if err != nil {
		return nil, fmt.Errorf("error getting weight history: %w", err)
	}

	if len(history) == 0 {
		return &dto.WeightProgressResponse{
			ExerciseID: exerciseID,
			History:    []dto.WeightHistoryPoint{},
		}, nil
	}

	var points []dto.WeightHistoryPoint
	for _, log := range history {
		points = append(points, dto.WeightHistoryPoint{
			Date:   log.CreatedAt.Format("2006-01-02"),
			Weight: log.Weight,
			Reps:   log.Reps,
		})
	}

	return &dto.WeightProgressResponse{
		ExerciseID: exerciseID,
		History:    points,
	}, nil
}

func (s *workoutService) DeleteWorkoutLog(ctx context.Context, id, userID int64) error {
	return s.workoutRepo.DeleteWorkoutLog(ctx, id, userID)
}

func (s *workoutService) DeleteAllWorkoutLogs(ctx context.Context, userID int64) error {
	return s.workoutRepo.DeleteAllWorkoutLogs(ctx, userID)
}
