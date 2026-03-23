package config

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"gopkg.in/yaml.v3"
)

// Config holds all configuration options
type Config struct {
	Port       int    `yaml:"port"`
	LocalOnly  bool   `yaml:"local_only"`
	ConfigPath string `yaml:"-"` // Not serialized
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Port:      8080,
		LocalOnly: false,
	}
}

// Load loads configuration from CLI flags, environment variables, and config file
// Priority: CLI flags > Environment variables > Config file > Defaults
func Load() (*Config, error) {
	cfg := DefaultConfig()

	// Load from config file first (lowest priority after defaults)
	if err := loadFromFile(cfg); err != nil {
		// Config file is optional, so don't fail if it doesn't exist
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("failed to load config file: %w", err)
		}
	}

	// Load from environment variables (higher priority than config file)
	loadFromEnv(cfg)

	// Load from CLI flags (highest priority)
	if err := loadFromFlags(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

// loadFromFile loads configuration from ~/.config/dcp/config.yaml
func loadFromFile(cfg *Config) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	configPath := filepath.Join(homeDir, ".config", "dcp", "config.yaml")
	
	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return fmt.Errorf("invalid config file: %w", err)
	}

	return nil
}

// loadFromEnv loads configuration from environment variables
func loadFromEnv(cfg *Config) {
	if port := os.Getenv("PORT"); port != "" {
		if p, err := strconv.Atoi(port); err == nil {
			cfg.Port = p
		}
	}

	if localOnly := os.Getenv("LOCAL_ONLY"); localOnly != "" {
		cfg.LocalOnly = localOnly == "true" || localOnly == "1"
	}
}

// loadFromFlags loads configuration from CLI flags
func loadFromFlags(cfg *Config) error {
	// Define flags
	portFlag := flag.Int("port", cfg.Port, "Server port (default: 8080)")
	localOnlyFlag := flag.Bool("local-only", cfg.LocalOnly, "Bind to 127.0.0.1 only")

	// Parse flags
	flag.Parse()

	// Update config with flag values
	cfg.Port = *portFlag
	cfg.LocalOnly = *localOnlyFlag

	return nil
}

// GetAddress returns the bind address based on LocalOnly setting
func (c *Config) GetAddress() string {
	if c.LocalOnly {
		return fmt.Sprintf("127.0.0.1:%d", c.Port)
	}
	return fmt.Sprintf(":%d", c.Port)
}

// GetServerURL returns the full server URL
func (c *Config) GetServerURL() string {
	if c.LocalOnly {
		return fmt.Sprintf("http://127.0.0.1:%d", c.Port)
	}
	return fmt.Sprintf("http://0.0.0.0:%d", c.Port)
}
