.PHONY: dev build clean install

# Development: Build frontend and run Go server
# This builds the frontend and runs the server with embedded files
dev:
	cd frontend && npm run build && \
	cd .. && \
	go run .

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
