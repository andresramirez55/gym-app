package config

import (
	"fmt"
	"os"
)

type Config struct {
	ServerPort string
	Database   DatabaseConfig
	ClaudeAPI  ClaudeAPIConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type ClaudeAPIConfig struct {
	APIKey string
}

func Load() (*Config, error) {
	config := &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "gym_app"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		ClaudeAPI: ClaudeAPIConfig{
			APIKey: os.Getenv("CLAUDE_API_KEY"), // Opcional - solo necesario si usas AI service
		},
	}

	// CLAUDE_API_KEY es opcional ahora que usamos templates
	// Solo se necesita si decides usar el AI service en el futuro

	return config, nil
}

func (c *DatabaseConfig) ConnectionString() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
