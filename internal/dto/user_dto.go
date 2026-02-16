package dto

import "github.com/andresramirez/gym-app/internal/domain"

type CreateUserRequest struct {
	Name      string              `json:"name" binding:"required"`
	Email     string              `json:"email" binding:"required,email"`
	Goal      domain.FitnessGoal  `json:"goal" binding:"required"`
	Frequency domain.Frequency    `json:"frequency" binding:"required"`
}

type UpdateUserRequest struct {
	Name      *string             `json:"name,omitempty"`
	Goal      *domain.FitnessGoal `json:"goal,omitempty"`
	Frequency *domain.Frequency   `json:"frequency,omitempty"`
}

type UserResponse struct {
	ID        int64              `json:"id"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	Goal      domain.FitnessGoal `json:"goal"`
	Frequency domain.Frequency   `json:"frequency"`
	CreatedAt string             `json:"created_at"`
}
