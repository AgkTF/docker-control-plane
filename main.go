// main.go is at the root level because Go embed cannot use ../ paths
// to access directories outside the package. The frontend/dist folder
// must be embedded from a parent or sibling directory.
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/docker-control-plane/dcp/internal/api"
	"github.com/docker-control-plane/dcp/internal/store"
)

//go:embed all:frontend/dist
var frontendFS embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize database
	dbPath := getDBPath()
	dbStore, err := store.New(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbStore.Close()

	// Get the frontend/dist subdirectory from embedded filesystem
	distFS, err := fs.Sub(frontendFS, "frontend/dist")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}

	// Setup routes
	mux := http.NewServeMux()
	
	// API routes
	api.SetupRoutes(mux, dbStore)
	
	// Health check endpoint
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Serve static files
	fs := http.FileServer(http.FS(distFS))
	mux.Handle("/", fs)

	addr := ":" + port
	fmt.Printf("Server starting on http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func getDBPath() string {
	// Use a data directory in the user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "dcp.db"
	}
	
	dataDir := filepath.Join(homeDir, ".local", "share", "dcp")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return "dcp.db"
	}
	
	return filepath.Join(dataDir, "dcp.db")
}
