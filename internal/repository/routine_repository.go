package repository

import (
	"context"
	"database/sql"

	"github.com/andresramirez/gym-app/internal/domain"
)

type RoutineRepository interface {
	Create(ctx context.Context, routine *domain.Routine) error
	CreateDay(ctx context.Context, day *domain.RoutineDay) error
	CreateExercise(ctx context.Context, exercise *domain.Exercise) error
	UpdateExercise(ctx context.Context, exercise *domain.Exercise) error
	GetByID(ctx context.Context, id int64) (*domain.Routine, error)
	GetActiveByUserID(ctx context.Context, userID int64) (*domain.Routine, error)
	GetDaysByRoutineID(ctx context.Context, routineID int64) ([]domain.RoutineDay, error)
	GetExercisesByDayID(ctx context.Context, dayID int64) ([]domain.Exercise, error)
	DeactivateUserRoutines(ctx context.Context, userID int64) error
}

type routineRepository struct {
	db *sql.DB
}

func NewRoutineRepository(db *sql.DB) RoutineRepository {
	return &routineRepository{db: db}
}

func (r *routineRepository) Create(ctx context.Context, routine *domain.Routine) error {
	if routine.DurationWeeks == 0 {
		routine.DurationWeeks = 3
	}
	query := `
		INSERT INTO routines (user_id, name, description, goal, frequency, is_active, duration_weeks, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		routine.UserID, routine.Name, routine.Description, routine.Goal,
		routine.Frequency, routine.IsActive, routine.DurationWeeks,
	).Scan(&routine.ID, &routine.CreatedAt, &routine.UpdatedAt)
}

func (r *routineRepository) CreateDay(ctx context.Context, day *domain.RoutineDay) error {
	query := `
		INSERT INTO routine_days (routine_id, day_number, day_name, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		day.RoutineID, day.DayNumber, day.DayName,
	).Scan(&day.ID, &day.CreatedAt)
}

func (r *routineRepository) CreateExercise(ctx context.Context, exercise *domain.Exercise) error {
	query := `
		INSERT INTO exercises (routine_day_id, name, sets, reps, rest_seconds, "order", notes, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		exercise.RoutineDayID, exercise.Name, exercise.Sets, exercise.Reps,
		exercise.RestSeconds, exercise.Order, exercise.Notes,
	).Scan(&exercise.ID, &exercise.CreatedAt)
}

func (r *routineRepository) UpdateExercise(ctx context.Context, exercise *domain.Exercise) error {
	query := `
		UPDATE exercises
		SET name = $1, sets = $2, reps = $3, rest_seconds = $4, notes = $5
		WHERE id = $6
	`
	_, err := r.db.ExecContext(ctx, query,
		exercise.Name, exercise.Sets, exercise.Reps,
		exercise.RestSeconds, exercise.Notes, exercise.ID,
	)
	return err
}

func (r *routineRepository) GetByID(ctx context.Context, id int64) (*domain.Routine, error) {
	routine := &domain.Routine{}
	query := `
		SELECT id, user_id, name, description, goal, frequency, is_active, duration_weeks, created_at, updated_at
		FROM routines
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&routine.ID, &routine.UserID, &routine.Name, &routine.Description,
		&routine.Goal, &routine.Frequency, &routine.IsActive, &routine.DurationWeeks,
		&routine.CreatedAt, &routine.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return routine, nil
}

func (r *routineRepository) GetActiveByUserID(ctx context.Context, userID int64) (*domain.Routine, error) {
	routine := &domain.Routine{}
	query := `
		SELECT id, user_id, name, description, goal, frequency, is_active, duration_weeks, created_at, updated_at
		FROM routines
		WHERE user_id = $1 AND is_active = true
		ORDER BY created_at DESC
		LIMIT 1
	`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&routine.ID, &routine.UserID, &routine.Name, &routine.Description,
		&routine.Goal, &routine.Frequency, &routine.IsActive, &routine.DurationWeeks,
		&routine.CreatedAt, &routine.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return routine, nil
}

func (r *routineRepository) GetDaysByRoutineID(ctx context.Context, routineID int64) ([]domain.RoutineDay, error) {
	query := `
		SELECT id, routine_id, day_number, day_name, created_at
		FROM routine_days
		WHERE routine_id = $1
		ORDER BY day_number
	`
	rows, err := r.db.QueryContext(ctx, query, routineID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var days []domain.RoutineDay
	for rows.Next() {
		var day domain.RoutineDay
		if err := rows.Scan(&day.ID, &day.RoutineID, &day.DayNumber, &day.DayName, &day.CreatedAt); err != nil {
			return nil, err
		}
		days = append(days, day)
	}
	return days, rows.Err()
}

func (r *routineRepository) GetExercisesByDayID(ctx context.Context, dayID int64) ([]domain.Exercise, error) {
	query := `
		SELECT id, routine_day_id, name, sets, reps, rest_seconds, "order", COALESCE(notes, ''), created_at
		FROM exercises
		WHERE routine_day_id = $1
		ORDER BY "order"
	`
	rows, err := r.db.QueryContext(ctx, query, dayID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exercises []domain.Exercise
	for rows.Next() {
		var ex domain.Exercise
		if err := rows.Scan(&ex.ID, &ex.RoutineDayID, &ex.Name, &ex.Sets, &ex.Reps,
			&ex.RestSeconds, &ex.Order, &ex.Notes, &ex.CreatedAt); err != nil {
			return nil, err
		}
		exercises = append(exercises, ex)
	}
	return exercises, rows.Err()
}

func (r *routineRepository) DeactivateUserRoutines(ctx context.Context, userID int64) error {
	query := `UPDATE routines SET is_active = false WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
