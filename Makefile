.PHONY: dev build clean install

# Development: Run Vite dev server for frontend hot reload
# For full stack development with API, run the Go server separately: go run .
dev:
	cd frontend && npm run dev

# Build: Build React frontend, then Go binary with embedded files
# This creates a single binary that serves the frontend
build:
	cd frontend && npm run build && \
	cd .. && \
	go build -o dcp .

# Clean build artifacts
clean:
	rm -rf frontend/dist
	rm -f dcp

# Install frontend dependencies
install:
	cd frontend && npm install
