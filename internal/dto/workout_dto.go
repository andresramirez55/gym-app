package dto

type LogWorkoutRequest struct {
	UserID       int64             `json:"user_id" binding:"required"`
	RoutineID    int64             `json:"routine_id" binding:"required"`
	RoutineDayID int64             `json:"routine_day_id" binding:"required"`
	Duration     int               `json:"duration"` // in minutes
	Notes        string            `json:"notes,omitempty"`
	ExerciseLogs []ExerciseLogDTO  `json:"exercise_logs" binding:"required"`
}

type ExerciseLogDTO struct {
	ExerciseID int64      `json:"exercise_id" binding:"required"`
	Sets       []SetLogDTO `json:"sets" binding:"required"`
}

type SetLogDTO struct {
	SetNumber int     `json:"set_number" binding:"required"`
	Weight    float64 `json:"weight" binding:"required"` // in kg
	Reps      int     `json:"reps" binding:"required"`
	RIR       *int    `json:"rir,omitempty"` // Reps in Reserve, opcional (0-4+)
}

type WorkoutLogResponse struct {
	ID           int64               `json:"id"`
	RoutineDayID int64               `json:"routine_day_id"`
	DayName      string              `json:"day_name"`
	CompletedAt  string              `json:"completed_at"`
	Duration     int                 `json:"duration"`
	ExerciseLogs []ExerciseLogDetail `json:"exercise_logs"`
}

type ExerciseLogDetail struct {
	ExerciseName string      `json:"exercise_name"`
	Sets         []SetLogDTO `json:"sets"`
}

type WeightProgressResponse struct {
	ExerciseID   int64             `json:"exercise_id"`
	ExerciseName string            `json:"exercise_name"`
	History      []WeightHistoryPoint `json:"history"`
}

type WeightHistoryPoint struct {
	Date   string  `json:"date"`
	Weight float64 `json:"weight"`
	Reps   int     `json:"reps"`
	RIR    *int    `json:"rir,omitempty"`
}
