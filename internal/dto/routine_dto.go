package dto

import "github.com/andresramirez/gym-app/internal/domain"

type GenerateRoutineRequest struct {
	UserID    int64              `json:"user_id" binding:"required"`
	Goal      domain.FitnessGoal `json:"goal" binding:"required"`
	Frequency domain.Frequency   `json:"frequency" binding:"required"`
}

type CreateRoutineRequest struct {
	UserID        int64              `json:"user_id" binding:"required"`
	Name          string             `json:"name" binding:"required"`
	Goal          domain.FitnessGoal `json:"goal" binding:"required"`
	DurationWeeks int                `json:"duration_weeks" binding:"required"`
	Frequency     domain.Frequency   `json:"frequency" binding:"required"`
	Days          []CreateDayRequest `json:"days" binding:"required,min=1"`
}

type CreateDayRequest struct {
	DayName   string                  `json:"day_name" binding:"required"`
	Exercises []CreateExerciseRequest `json:"exercises" binding:"required,min=1"`
}

type CreateExerciseRequest struct {
	Name        string `json:"name" binding:"required"`
	Sets        int    `json:"sets" binding:"required,min=1"`
	Reps        string `json:"reps" binding:"required"`
	RestSeconds int    `json:"rest_seconds" binding:"min=0"`
	Notes       string `json:"notes,omitempty"`
}

type ImportRoutineRequest struct {
	UserID        int64              `json:"user_id" binding:"required"`
	Text          string             `json:"text" binding:"required"`
	Goal          domain.FitnessGoal `json:"goal" binding:"required"`
	DurationWeeks int                `json:"duration_weeks" binding:"required"`
	Frequency     domain.Frequency   `json:"frequency" binding:"required"`
}

type RoutineResponse struct {
	ID            int64              `json:"id"`
	UserID        int64              `json:"user_id"`
	Name          string             `json:"name"`
	Description   string             `json:"description"`
	Goal          domain.FitnessGoal `json:"goal"`
	Frequency     domain.Frequency   `json:"frequency"`
	IsActive      bool               `json:"is_active"`
	DurationWeeks int                `json:"duration_weeks"`
	WeekNumber    int                `json:"week_number"`
	DaysRemaining int                `json:"days_remaining"`
	Days          []RoutineDayDTO    `json:"days"`
	CreatedAt     string             `json:"created_at"`
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

type RoutineSuggestionResponse struct {
	ID        int64                `json:"id"`
	RoutineID int64                `json:"routine_id"`
	Diagnosis string               `json:"diagnosis"`
	Routine   CreateRoutineRequest `json:"routine"`
	CreatedAt string               `json:"created_at"`
}

type UpdateExerciseRequest struct {
	Name        string `json:"name" binding:"required"`
	Sets        int    `json:"sets"`
	Reps        string `json:"reps"`
	RestSeconds int    `json:"rest_seconds"`
	Notes       string `json:"notes"`
}
