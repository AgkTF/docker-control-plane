package compose

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

var composeFilenames = []string{
	"docker-compose.yml",
	"docker-compose.yaml",
	"compose.yml",
	"compose.yaml",
}

type ComposeFile struct {
	Name string `yaml:"name"`
	Services map[string]interface{} `yaml:"services"`
}

func FindComposeFile(dir string) (string, error) {
	for _, filename := range composeFilenames {
		path := filepath.Join(dir, filename)
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
	}
	return "", fmt.Errorf("no compose file found in directory: %s", dir)
}

func ExtractProjectName(dir string, composePath string) (string, error) {
	// Try to read name from compose file
	data, err := os.ReadFile(composePath)
	if err != nil {
		return "", fmt.Errorf("failed to read compose file: %w", err)
	}

	var compose ComposeFile
	if err := yaml.Unmarshal(data, &compose); err != nil {
		// If we can't parse it, just use directory name
		return filepath.Base(dir), nil
	}

	// If name is specified in compose file, use it
	if compose.Name != "" {
		return compose.Name, nil
	}

	// Otherwise use directory name
	return filepath.Base(dir), nil
}

func ValidateDirectory(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("path does not exist")
		}
		return fmt.Errorf("failed to stat path: %w", err)
	}

	if !info.IsDir() {
		return fmt.Errorf("path is not a directory")
	}

	return nil
}
