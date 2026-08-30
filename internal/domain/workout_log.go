package domain

import "time"

type WorkoutLog struct {
	ID           int64     `json:"id" db:"id"`
	UserID       int64     `json:"user_id" db:"user_id"`
	RoutineID    int64     `json:"routine_id" db:"routine_id"`
	RoutineDayID int64     `json:"routine_day_id" db:"routine_day_id"`
	CompletedAt  time.Time `json:"completed_at" db:"completed_at"`
	Duration     int       `json:"duration" db:"duration"` // in minutes
	Notes        string    `json:"notes" db:"notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`

	// Relation
	ExerciseLogs []ExerciseLog `json:"exercise_logs,omitempty" db:"-"`
}

type ExerciseLog struct {
	ID            int64     `json:"id" db:"id"`
	WorkoutLogID  int64     `json:"workout_log_id" db:"workout_log_id"`
	ExerciseID    int64     `json:"exercise_id" db:"exercise_id"`
	ExerciseName  string    `json:"exercise_name" db:"exercise_name"` // Denormalized for history
	SetsCompleted int       `json:"sets_completed" db:"sets_completed"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`

	// Relation
	Sets []SetLog `json:"sets,omitempty" db:"-"`
}

type SetLog struct {
	ID            int64     `json:"id" db:"id"`
	ExerciseLogID int64     `json:"exercise_log_id" db:"exercise_log_id"`
	SetNumber     int       `json:"set_number" db:"set_number"`
	Weight        float64   `json:"weight" db:"weight"` // in kg
	Reps          int       `json:"reps" db:"reps"`
	RIR           *int      `json:"rir,omitempty" db:"rir"` // Reps in Reserve, opcional
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}
