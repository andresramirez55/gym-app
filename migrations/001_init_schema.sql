-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    goal VARCHAR(50) NOT NULL,
    frequency INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(50) NOT NULL,
    frequency INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_is_active ON routines(is_active);

-- Create routine_days table
CREATE TABLE IF NOT EXISTS routine_days (
    id BIGSERIAL PRIMARY KEY,
    routine_id BIGINT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routine_days_routine_id ON routine_days(routine_id);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    routine_day_id BIGINT NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps VARCHAR(50) NOT NULL,
    rest_seconds INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_routine_day_id ON exercises(routine_day_id);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id BIGINT NOT NULL REFERENCES routines(id),
    routine_day_id BIGINT NOT NULL REFERENCES routine_days(id),
    completed_at TIMESTAMP NOT NULL,
    duration INTEGER, -- in minutes
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_completed_at ON workout_logs(completed_at);

-- Create exercise_logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
    id BIGSERIAL PRIMARY KEY,
    workout_log_id BIGINT NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),
    exercise_name VARCHAR(255) NOT NULL, -- denormalized for history
    sets_completed INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_logs_workout_log_id ON exercise_logs(workout_log_id);
CREATE INDEX idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);

-- Create set_logs table
CREATE TABLE IF NOT EXISTS set_logs (
    id BIGSERIAL PRIMARY KEY,
    exercise_log_id BIGINT NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DECIMAL(10, 2) NOT NULL, -- in kg
    reps INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_set_logs_exercise_log_id ON set_logs(exercise_log_id);
