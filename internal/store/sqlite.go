package store

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	ComposeFile string    `json:"compose_file"`
	CreatedAt   time.Time `json:"created_at"`
}

type Store struct {
	db *sql.DB
}

func New(dbPath string) (*Store, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	store := &Store{db: db}
	if err := store.migrate(); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return store, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS projects (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		path TEXT NOT NULL UNIQUE,
		compose_file TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path);
	`
	_, err := s.db.Exec(query)
	return err
}

func (s *Store) CreateProject(name, path, composeFile string) (*Project, error) {
	project := &Project{
		ID:          uuid.New().String(),
		Name:        name,
		Path:        path,
		ComposeFile: composeFile,
		CreatedAt:   time.Now(),
	}

	query := `INSERT INTO projects (id, name, path, compose_file, created_at) VALUES (?, ?, ?, ?, ?)`
	_, err := s.db.Exec(query, project.ID, project.Name, project.Path, project.ComposeFile, project.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert project: %w", err)
	}

	return project, nil
}

func (s *Store) GetProjectByID(id string) (*Project, error) {
	query := `SELECT id, name, path, compose_file, created_at FROM projects WHERE id = ?`
	row := s.db.QueryRow(query, id)

	var project Project
	err := row.Scan(&project.ID, &project.Name, &project.Path, &project.ComposeFile, &project.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("project not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to scan project: %w", err)
	}

	return &project, nil
}

func (s *Store) GetProjectByPath(path string) (*Project, error) {
	query := `SELECT id, name, path, compose_file, created_at FROM projects WHERE path = ?`
	row := s.db.QueryRow(query, path)

	var project Project
	err := row.Scan(&project.ID, &project.Name, &project.Path, &project.ComposeFile, &project.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to scan project: %w", err)
	}

	return &project, nil
}

func (s *Store) ListProjects() ([]*Project, error) {
	query := `SELECT id, name, path, compose_file, created_at FROM projects ORDER BY created_at DESC`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer rows.Close()

	projects := make([]*Project, 0)
	for rows.Next() {
		var project Project
		err := rows.Scan(&project.ID, &project.Name, &project.Path, &project.ComposeFile, &project.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, &project)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating projects: %w", err)
	}

	return projects, nil
}

func (s *Store) DeleteProject(id string) error {
	query := `DELETE FROM projects WHERE id = ?`
	result, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("project not found")
	}

	return nil
}
