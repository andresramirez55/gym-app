package repository

import (
	"context"
	"database/sql"

	"github.com/andresramirez/gym-app/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id int64) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id int64) error
	UpdatePushToken(ctx context.Context, userID int64, token string) error
	GetPushToken(ctx context.Context, userID int64) (string, error)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (name, email, goal, frequency, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		user.Name, user.Email, user.Goal, user.Frequency,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	user := &domain.User{}
	query := `
		SELECT id, name, email, goal, frequency, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Name, &user.Email, &user.Goal, &user.Frequency,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	user := &domain.User{}
	query := `
		SELECT id, name, email, goal, frequency, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Name, &user.Email, &user.Goal, &user.Frequency,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET name = $1, goal = $2, frequency = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		user.Name, user.Goal, user.Frequency, user.ID,
	).Scan(&user.UpdatedAt)
}

func (r *userRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *userRepository) UpdatePushToken(ctx context.Context, userID int64, token string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET push_token = $1 WHERE id = $2`, token, userID)
	return err
}

func (r *userRepository) GetPushToken(ctx context.Context, userID int64) (string, error) {
	var token sql.NullString
	err := r.db.QueryRowContext(ctx, `SELECT push_token FROM users WHERE id = $1`, userID).Scan(&token)
	if err != nil {
		return "", err
	}
	return token.String, nil
}
