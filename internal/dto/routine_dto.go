package dto

import "github.com/andresramirez/gym-app/internal/domain"

type GenerateRoutineRequest struct {
	UserID    int64              `json:"user_id" binding:"required"`
	Goal      domain.FitnessGoal `json:"goal" binding:"required"`
	Frequency domain.Frequency   `json:"frequency" binding:"required"`
}

type RoutineResponse struct {
	ID          int64              `json:"id"`
	UserID      int64              `json:"user_id"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Goal        domain.FitnessGoal `json:"goal"`
	Frequency   domain.Frequency   `json:"frequency"`
	IsActive    bool               `json:"is_active"`
	Days        []RoutineDayDTO    `json:"days"`
	CreatedAt   string             `json:"created_at"`
}

type RoutineDayDTO struct {
	ID        int64         `json:"id"`
	DayNumber int           `json:"day_number"`
	DayName   string        `json:"day_name"`
	Exercises []ExerciseDTO `json:"exercises"`
}

type ExerciseDTO struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Sets        int    `json:"sets"`
	Reps        string `json:"reps"`
	RestSeconds int    `json:"rest_seconds"`
	Order       int    `json:"order"`
	Notes       string `json:"notes,omitempty"`
}
