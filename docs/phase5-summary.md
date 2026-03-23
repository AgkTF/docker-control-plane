# Phase 5 Summary: Auto-Refresh & Polish

## Summary

Implemented automatic polling for container status updates, configuration support (port, local-only mode), error handling with consistent JSON envelope responses, and polished the UI with proper polling behavior using TanStack Query's built-in `refetchIntervalInBackground` option.

## Files Changed

### Backend

1. **internal/config/config.go** (new)
   - Added configuration management with support for:
     - CLI flags (`--port`, `--local-only`)
     - Environment variables (`PORT`, `LOCAL_ONLY`)
     - Config file at `~/.config/dcp/config.yaml`
   - Configuration priority: CLI flags > Environment variables > Config file > Defaults
   - Default port: 8080, default binding: 0.0.0.0 (all interfaces)

2. **main.go** (modified)
   - Updated to use new config package
   - Added 404 handler for unmatched API endpoints
   - Health check endpoint returns proper JSON envelope `{data, error}`
   - Server startup message now shows the correct URL based on configuration

### Frontend

3. **frontend/src/hooks/useContainers.ts** (modified)
   - Changed polling interval from 3 seconds to 2 seconds
   - Uses TanStack Query's built-in `refetchIntervalInBackground: false` option to pause polling when window is not visible
   - No custom hooks needed - leverages framework features

4. **frontend/src/hooks/useProjects.ts** (modified)
   - Added polling every 5 seconds
   - Uses TanStack Query's built-in `refetchIntervalInBackground: false` option to pause polling when window is not visible

## Key Decisions

1. **Polling Strategy**: 
   - Container list polls every 2 seconds when visible
   - Project list polls every 5 seconds when visible
   - Uses TanStack Query's built-in `refetchIntervalInBackground: false` option to pause polling when window is not visible
   - No custom visibility hooks needed - uses framework-native features

2. **Configuration Loading**:
   - Follows the standard priority pattern: CLI > Environment > Config File > Defaults
   - Config file uses YAML format at `~/.config/dcp/config.yaml`
   - `--local-only` flag binds to 127.0.0.1 instead of 0.0.0.0

3. **Error Responses**:
   - All API responses use consistent JSON envelope `{data, error}`
   - 404 errors return proper error response with code "NOT_FOUND"
   - Existing error codes preserved (INTERNAL_ERROR, INVALID_REQUEST, INVALID_PATH, DUPLICATE_PATH, NO_COMPOSE_FILE, PROJECT_NOT_FOUND, DOCKER_ERROR)

4. **Docker API Errors**:
   - Already handled in Phase 4 with user-friendly messages passed through the error envelope

## Acceptance Criteria Status

- [x] Container list polls for updates every 2 seconds
- [x] Polling pauses when window is not visible (via `refetchIntervalInBackground: false`)
- [x] React Query manages polling and caching
- [x] `--port` flag sets server port (default 8080)
- [x] `PORT` environment variable sets server port
- [x] `--local-only` flag binds to 127.0.0.1 instead of 0.0.0.0
- [x] Config file support at `~/.config/dcp/config.yaml`
- [x] All API responses use consistent JSON envelope `{data, error}`
- [x] Error codes defined for common error scenarios
- [x] 404 returns proper error response
- [x] Docker API errors return user-friendly messages (from Phase 4)
- [x] Single binary produced by `make build`
- [x] Binary runs without external dependencies

## Build & Run

```bash
# Build the binary
make build

# Run with default settings (port 8080, all interfaces)
./dcp

# Run on custom port
./dcp --port 3000

# Run in local-only mode
./dcp --local-only

# Run with environment variable
PORT=9000 ./dcp
```

## Notes

- The config file at `~/.config/dcp/config.yaml` is optional
- Uses TanStack Query's built-in `refetchIntervalInBackground` option (no custom hooks)
- All existing functionality remains backward compatible
- No breaking changes to API contracts
- The binary embeds the React frontend and serves it as static files
