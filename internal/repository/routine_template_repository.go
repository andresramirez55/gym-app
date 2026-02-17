package repository

import (
	"context"
	"database/sql"
)

type RoutineTemplate struct {
	ID          int64
	Name        string
	Description string
	Goal        string
	Frequency   int
}

type RoutineTemplateDay struct {
	ID         int64
	TemplateID int64
	DayNumber  int
	DayName    string
}

type RoutineTemplateExercise struct {
	ID            int64
	TemplateDayID int64
	Name          string
	Sets          int
	Reps          int
	RestSeconds   int
	Order         int
	Notes         string
}

type RoutineTemplateRepository interface {
	GetRandomTemplate(ctx context.Context, goal string, frequency int) (*RoutineTemplate, error)
	GetRandomTemplateExcluding(ctx context.Context, goal string, frequency int, excludeName string) (*RoutineTemplate, error)
	GetTemplateDays(ctx context.Context, templateID int64) ([]RoutineTemplateDay, error)
	GetTemplateExercises(ctx context.Context, templateDayID int64) ([]RoutineTemplateExercise, error)
}

type routineTemplateRepository struct {
	db *sql.DB
}

func NewRoutineTemplateRepository(db *sql.DB) RoutineTemplateRepository {
	return &routineTemplateRepository{db: db}
}

func (r *routineTemplateRepository) GetRandomTemplate(ctx context.Context, goal string, frequency int) (*RoutineTemplate, error) {
	query := `
		SELECT id, name, description, goal, frequency
		FROM routine_templates
		WHERE goal = $1 AND frequency = $2
		ORDER BY RANDOM()
		LIMIT 1
	`

	template := &RoutineTemplate{}
	err := r.db.QueryRowContext(ctx, query, goal, frequency).Scan(
		&template.ID,
		&template.Name,
		&template.Description,
		&template.Goal,
		&template.Frequency,
	)

	if err != nil {
		return nil, err
	}

	return template, nil
}

func (r *routineTemplateRepository) GetRandomTemplateExcluding(ctx context.Context, goal string, frequency int, excludeName string) (*RoutineTemplate, error) {
	// Prefer a different template; if none available, fall back to any
	query := `
		SELECT id, name, description, goal, frequency
		FROM routine_templates
		WHERE goal = $1 AND frequency = $2
		ORDER BY CASE WHEN name = $3 THEN 1 ELSE 0 END, RANDOM()
		LIMIT 1
	`
	template := &RoutineTemplate{}
	err := r.db.QueryRowContext(ctx, query, goal, frequency, excludeName).Scan(
		&template.ID, &template.Name, &template.Description, &template.Goal, &template.Frequency,
	)
	if err != nil {
		return nil, err
	}
	return template, nil
}

func (r *routineTemplateRepository) GetTemplateDays(ctx context.Context, templateID int64) ([]RoutineTemplateDay, error) {
	query := `
		SELECT id, template_id, day_number, day_name
		FROM routine_template_days
		WHERE template_id = $1
		ORDER BY day_number
	`

	rows, err := r.db.QueryContext(ctx, query, templateID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var days []RoutineTemplateDay
	for rows.Next() {
		var day RoutineTemplateDay
		if err := rows.Scan(&day.ID, &day.TemplateID, &day.DayNumber, &day.DayName); err != nil {
			return nil, err
		}
		days = append(days, day)
	}

	return days, rows.Err()
}

func (r *routineTemplateRepository) GetTemplateExercises(ctx context.Context, templateDayID int64) ([]RoutineTemplateExercise, error) {
	query := `
		SELECT id, template_day_id, name, sets, reps, rest_seconds, "order", notes
		FROM routine_template_exercises
		WHERE template_day_id = $1
		ORDER BY "order"
	`

	rows, err := r.db.QueryContext(ctx, query, templateDayID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exercises []RoutineTemplateExercise
	for rows.Next() {
		var ex RoutineTemplateExercise
		if err := rows.Scan(&ex.ID, &ex.TemplateDayID, &ex.Name, &ex.Sets, &ex.Reps, &ex.RestSeconds, &ex.Order, &ex.Notes); err != nil {
			return nil, err
		}
		exercises = append(exercises, ex)
	}

	return exercises, rows.Err()
}
