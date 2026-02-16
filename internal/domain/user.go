package domain

import "time"

type FitnessGoal string

const (
	GainMuscle    FitnessGoal = "gain_muscle"
	LoseWeight    FitnessGoal = "lose_weight"
	BuildStrength FitnessGoal = "build_strength"
	Endurance     FitnessGoal = "endurance"
	General       FitnessGoal = "general_fitness"
)

type Frequency int

const (
	ThreeDays Frequency = 3
	FiveDays  Frequency = 5
)

type User struct {
	ID        int64       `json:"id" db:"id"`
	Name      string      `json:"name" db:"name"`
	Email     string      `json:"email" db:"email"`
	Goal      FitnessGoal `json:"goal" db:"goal"`
	Frequency Frequency   `json:"frequency" db:"frequency"`
	CreatedAt time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt time.Time   `json:"updated_at" db:"updated_at"`
}
