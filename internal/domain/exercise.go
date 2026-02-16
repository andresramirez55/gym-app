package domain

import "time"

type Exercise struct {
	ID           int64     `json:"id" db:"id"`
	RoutineDayID int64     `json:"routine_day_id" db:"routine_day_id"`
	Name         string    `json:"name" db:"name"`
	Sets         int       `json:"sets" db:"sets"`
	Reps         string    `json:"reps" db:"reps"` // e.g., "8-12", "10", "15-20"
	RestSeconds  int       `json:"rest_seconds" db:"rest_seconds"`
	Order        int       `json:"order" db:"order"` // Order in the day
	Notes        string    `json:"notes" db:"notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
