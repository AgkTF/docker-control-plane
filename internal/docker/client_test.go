package docker

import (
	"encoding/json"
	"testing"
)

func TestCalculateCPUPercentage(t *testing.T) {
	tests := []struct {
		name            string
		cpuDelta        float64
		systemDelta     float64
		percpuCount     int
		expectedPercent float64
	}{
		{
			name:            "normal usage",
			cpuDelta:        100000000,
			systemDelta:     100000000,
			percpuCount:     2,
			expectedPercent: 200.0,
		},
		{
			name:            "zero system delta",
			cpuDelta:        100000000,
			systemDelta:     0,
			percpuCount:     2,
			expectedPercent: 0.0,
		},
		{
			name:            "zero cpu delta",
			cpuDelta:        0,
			systemDelta:     100000000,
			percpuCount:     2,
			expectedPercent: 0.0,
		},
		{
			name:            "50% single core",
			cpuDelta:        50000000,
			systemDelta:     100000000,
			percpuCount:     1,
			expectedPercent: 50.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cpuPercentage := 0.0
			if tt.systemDelta > 0 && tt.cpuDelta > 0 {
				cpuPercentage = (tt.cpuDelta / tt.systemDelta) * float64(tt.percpuCount) * 100.0
			}

			if cpuPercentage != tt.expectedPercent {
				t.Errorf("Expected CPU percentage %.2f, got %.2f", tt.expectedPercent, cpuPercentage)
			}
		})
	}
}

func TestCalculateMemoryPercentage(t *testing.T) {
	tests := []struct {
		name            string
		usage           uint64
		limit           uint64
		expectedPercent float64
	}{
		{
			name:            "50% usage",
			usage:           512 * 1024 * 1024,  // 512MB
			limit:           1024 * 1024 * 1024, // 1GB
			expectedPercent: 50.0,
		},
		{
			name:            "zero limit",
			usage:           512 * 1024 * 1024,
			limit:           0,
			expectedPercent: 0.0,
		},
		{
			name:            "zero usage",
			usage:           0,
			limit:           1024 * 1024 * 1024,
			expectedPercent: 0.0,
		},
		{
			name:            "25% usage",
			usage:           256 * 1024 * 1024,  // 256MB
			limit:           1024 * 1024 * 1024, // 1GB
			expectedPercent: 25.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			memoryPercentage := 0.0
			if tt.limit > 0 {
				memoryPercentage = float64(tt.usage) / float64(tt.limit) * 100.0
			}

			if memoryPercentage != tt.expectedPercent {
				t.Errorf("Expected memory percentage %.2f, got %.2f", tt.expectedPercent, memoryPercentage)
			}
		})
	}
}

func TestContainerStats_Struct(t *testing.T) {
	stats := ContainerStats{
		CPUPercentage:    25.5,
		MemoryPercentage: 50.0,
		PIDs:             10,
	}

	if stats.CPUPercentage != 25.5 {
		t.Errorf("Expected CPU percentage 25.5, got %.2f", stats.CPUPercentage)
	}
	if stats.MemoryPercentage != 50.0 {
		t.Errorf("Expected memory percentage 50.0, got %.2f", stats.MemoryPercentage)
	}
	if stats.PIDs != 10 {
		t.Errorf("Expected PIDs 10, got %d", stats.PIDs)
	}
}

func TestContainerStats_JSONSerialization(t *testing.T) {
	stats := ContainerStats{
		CPUPercentage:    25.5,
		MemoryPercentage: 50.0,
		PIDs:             10,
	}

	data, err := json.Marshal(stats)
	if err != nil {
		t.Fatalf("Failed to marshal ContainerStats: %v", err)
	}

	expected := `{"cpu_percentage":25.5,"memory_percentage":50,"pids":10}`
	if string(data) != expected {
		t.Errorf("Expected JSON %s, got %s", expected, string(data))
	}

	// Test deserialization
	var decoded ContainerStats
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal ContainerStats: %v", err)
	}

	if decoded.CPUPercentage != stats.CPUPercentage {
		t.Errorf("Expected CPU percentage %.2f, got %.2f", stats.CPUPercentage, decoded.CPUPercentage)
	}
	if decoded.MemoryPercentage != stats.MemoryPercentage {
		t.Errorf("Expected memory percentage %.2f, got %.2f", stats.MemoryPercentage, decoded.MemoryPercentage)
	}
	if decoded.PIDs != stats.PIDs {
		t.Errorf("Expected PIDs %d, got %d", stats.PIDs, decoded.PIDs)
	}
}

// TestContainerStats_ZeroValues tests the behavior with zero/empty values
func TestContainerStats_ZeroValues(t *testing.T) {
	stats := ContainerStats{
		CPUPercentage:    0.0,
		MemoryPercentage: 0.0,
		PIDs:             0,
	}

	data, err := json.Marshal(stats)
	if err != nil {
		t.Fatalf("Failed to marshal zero ContainerStats: %v", err)
	}

	expected := `{"cpu_percentage":0,"memory_percentage":0,"pids":0}`
	if string(data) != expected {
		t.Errorf("Expected JSON %s, got %s", expected, string(data))
	}
}

// TestContainerStats_HighValues tests the behavior with high values
func TestContainerStats_HighValues(t *testing.T) {
	stats := ContainerStats{
		CPUPercentage:    400.0,
		MemoryPercentage: 99.9,
		PIDs:             32768,
	}

	data, err := json.Marshal(stats)
	if err != nil {
		t.Fatalf("Failed to marshal high value ContainerStats: %v", err)
	}

	var decoded ContainerStats
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal ContainerStats: %v", err)
	}

	if decoded.CPUPercentage != stats.CPUPercentage {
		t.Errorf("Expected CPU percentage %.2f, got %.2f", stats.CPUPercentage, decoded.CPUPercentage)
	}
	if decoded.MemoryPercentage != stats.MemoryPercentage {
		t.Errorf("Expected memory percentage %.2f, got %.2f", stats.MemoryPercentage, decoded.MemoryPercentage)
	}
	if decoded.PIDs != stats.PIDs {
		t.Errorf("Expected PIDs %d, got %d", stats.PIDs, decoded.PIDs)
	}
}
