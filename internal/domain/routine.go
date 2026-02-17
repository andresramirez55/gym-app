package domain

import "time"

type Routine struct {
	ID            int64       `json:"id" db:"id"`
	UserID        int64       `json:"user_id" db:"user_id"`
	Name          string      `json:"name" db:"name"`
	Description   string      `json:"description" db:"description"`
	Goal          FitnessGoal `json:"goal" db:"goal"`
	Frequency     Frequency   `json:"frequency" db:"frequency"`
	IsActive      bool        `json:"is_active" db:"is_active"`
	DurationWeeks int         `json:"duration_weeks" db:"duration_weeks"`
	CreatedAt     time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at" db:"updated_at"`

	// Computed (not stored)
	WeekNumber    int `json:"week_number" db:"-"`
	DaysRemaining int `json:"days_remaining" db:"-"`

	// Relation
	Days []RoutineDay `json:"days,omitempty" db:"-"`
}

type RoutineDay struct {
	ID        int64     `json:"id" db:"id"`
	RoutineID int64     `json:"routine_id" db:"routine_id"`
	DayNumber int       `json:"day_number" db:"day_number"` // 1, 2, 3... up to frequency
	DayName   string    `json:"day_name" db:"day_name"`     // e.g., "Pecho y Tríceps"
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// Relation
	Exercises []Exercise `json:"exercises,omitempty" db:"-"`
}
