package repository

import (
	"context"
	"database/sql"

	"github.com/andresramirez/gym-app/internal/domain"
)

type WorkoutRepository interface {
	CreateWorkoutLog(ctx context.Context, log *domain.WorkoutLog) error
	CreateExerciseLog(ctx context.Context, log *domain.ExerciseLog) error
	CreateSetLog(ctx context.Context, log *domain.SetLog) error
	GetWorkoutLogsByUserID(ctx context.Context, userID int64, limit int) ([]domain.WorkoutLog, error)
	GetExerciseLogsByWorkoutID(ctx context.Context, workoutID int64) ([]domain.ExerciseLog, error)
	GetSetLogsByExerciseLogID(ctx context.Context, exerciseLogID int64) ([]domain.SetLog, error)
	GetWeightHistoryByExercise(ctx context.Context, userID, exerciseID int64) ([]domain.SetLog, error)
}

type workoutRepository struct {
	db *sql.DB
}

func NewWorkoutRepository(db *sql.DB) WorkoutRepository {
	return &workoutRepository{db: db}
}

func (r *workoutRepository) CreateWorkoutLog(ctx context.Context, log *domain.WorkoutLog) error {
	query := `
		INSERT INTO workout_logs (user_id, routine_id, routine_day_id, completed_at, duration, notes, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		log.UserID, log.RoutineID, log.RoutineDayID, log.CompletedAt,
		log.Duration, log.Notes,
	).Scan(&log.ID, &log.CreatedAt)
}

func (r *workoutRepository) CreateExerciseLog(ctx context.Context, log *domain.ExerciseLog) error {
	query := `
		INSERT INTO exercise_logs (workout_log_id, exercise_id, exercise_name, sets_completed, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		log.WorkoutLogID, log.ExerciseID, log.ExerciseName, log.SetsCompleted,
	).Scan(&log.ID, &log.CreatedAt)
}

func (r *workoutRepository) CreateSetLog(ctx context.Context, log *domain.SetLog) error {
	query := `
		INSERT INTO set_logs (exercise_log_id, set_number, weight, reps, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		log.ExerciseLogID, log.SetNumber, log.Weight, log.Reps,
	).Scan(&log.ID, &log.CreatedAt)
}

func (r *workoutRepository) GetWorkoutLogsByUserID(ctx context.Context, userID int64, limit int) ([]domain.WorkoutLog, error) {
	query := `
		SELECT id, user_id, routine_id, routine_day_id, completed_at, duration, notes, created_at
		FROM workout_logs
		WHERE user_id = $1
		ORDER BY completed_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []domain.WorkoutLog
	for rows.Next() {
		var log domain.WorkoutLog
		if err := rows.Scan(&log.ID, &log.UserID, &log.RoutineID, &log.RoutineDayID,
			&log.CompletedAt, &log.Duration, &log.Notes, &log.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

func (r *workoutRepository) GetExerciseLogsByWorkoutID(ctx context.Context, workoutID int64) ([]domain.ExerciseLog, error) {
	query := `
		SELECT id, workout_log_id, exercise_id, exercise_name, sets_completed, created_at
		FROM exercise_logs
		WHERE workout_log_id = $1
	`
	rows, err := r.db.QueryContext(ctx, query, workoutID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []domain.ExerciseLog
	for rows.Next() {
		var log domain.ExerciseLog
		if err := rows.Scan(&log.ID, &log.WorkoutLogID, &log.ExerciseID,
			&log.ExerciseName, &log.SetsCompleted, &log.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

func (r *workoutRepository) GetSetLogsByExerciseLogID(ctx context.Context, exerciseLogID int64) ([]domain.SetLog, error) {
	query := `
		SELECT id, exercise_log_id, set_number, weight, reps, created_at
		FROM set_logs
		WHERE exercise_log_id = $1
		ORDER BY set_number
	`
	rows, err := r.db.QueryContext(ctx, query, exerciseLogID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []domain.SetLog
	for rows.Next() {
		var log domain.SetLog
		if err := rows.Scan(&log.ID, &log.ExerciseLogID, &log.SetNumber,
			&log.Weight, &log.Reps, &log.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

func (r *workoutRepository) GetWeightHistoryByExercise(ctx context.Context, userID, exerciseID int64) ([]domain.SetLog, error) {
	query := `
		SELECT sl.id, sl.exercise_log_id, sl.set_number, sl.weight, sl.reps, sl.created_at
		FROM set_logs sl
		JOIN exercise_logs el ON el.id = sl.exercise_log_id
		JOIN workout_logs wl ON wl.id = el.workout_log_id
		WHERE wl.user_id = $1 AND el.exercise_id = $2
		ORDER BY wl.completed_at DESC, sl.set_number
	`
	rows, err := r.db.QueryContext(ctx, query, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []domain.SetLog
	for rows.Next() {
		var log domain.SetLog
		if err := rows.Scan(&log.ID, &log.ExerciseLogID, &log.SetNumber,
			&log.Weight, &log.Reps, &log.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}
