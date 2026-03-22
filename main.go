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
	"github.com/docker-control-plane/dcp/internal/docker"
	"github.com/docker-control-plane/dcp/internal/store"
)

//go:embed all:frontend/dist
var frontendFS embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	devMode := os.Getenv("DEV_MODE") == "true"

	// Initialize database
	dbPath := getDBPath()
	dbStore, err := store.New(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbStore.Close()

	// Initialize Docker client
	dockerClient, err := docker.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize Docker client: %v", err)
	}
	defer dockerClient.Close()

	// Setup routes
	mux := http.NewServeMux()

	// API routes
	api.SetupRoutes(mux, dbStore, dockerClient)

	// Health check endpoint
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Only serve static files in production mode
	if !devMode {
		distFS, err := fs.Sub(frontendFS, "frontend/dist")
		if err != nil {
			log.Fatalf("Failed to create sub filesystem: %v", err)
		}
		fs := http.FileServer(http.FS(distFS))
		mux.Handle("/", fs)
		fmt.Printf("Production server starting on http://localhost:%s\n", port)
	} else {
		fmt.Printf("Development server starting on http://localhost:%s\n", port)
		fmt.Println("Frontend should be running separately on http://localhost:5173")
	}

	var handler http.Handler = mux

	// Add CORS middleware in development mode
	if devMode {
		handler = corsMiddleware(mux)
	}

	addr := ":" + port
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// corsMiddleware adds CORS headers for development
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow frontend dev server
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
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
