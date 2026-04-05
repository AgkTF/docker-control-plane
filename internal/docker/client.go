package docker

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

// Container represents a Docker container with compose-related metadata
type Container struct {
	ID      string        `json:"id"`
	Name    string        `json:"name"`
	Project string        `json:"project"`
	Service string        `json:"service"`
	Image   string        `json:"image"`
	Status  string        `json:"status"`
	State   string        `json:"state"`
	Ports   []PortMapping `json:"ports"`
}

// PortMapping represents a port mapping between host and container
type PortMapping struct {
	Host      string `json:"host"`
	Container string `json:"container"`
}

// Client wraps the Docker client
type Client struct {
	cli *client.Client
}

// NewClient creates a new Docker client
func NewClient() (*Client, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %w", err)
	}

	return &Client{cli: cli}, nil
}

// Close closes the Docker client connection
func (c *Client) Close() error {
	return c.cli.Close()
}

// Ping checks if Docker daemon is accessible
func (c *Client) Ping(ctx context.Context) error {
	_, err := c.cli.Ping(ctx)
	return err
}

// ListContainersByProject returns containers for a specific compose project
func (c *Client) ListContainersByProject(ctx context.Context, projectName string) ([]Container, error) {
	// Filter containers by compose project label
	filterArgs := filters.NewArgs()
	filterArgs.Add("label", fmt.Sprintf("com.docker.compose.project=%s", projectName))

	containers, err := c.cli.ContainerList(ctx, container.ListOptions{
		All:     true,
		Filters: filterArgs,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list containers: %w", err)
	}

	result := make([]Container, 0, len(containers))
	for _, ctn := range containers {
		container := c.convertToContainer(ctn)
		result = append(result, container)
	}

	return result, nil
}

// convertToContainer converts Docker API container to our Container type
func (c *Client) convertToContainer(ctn types.Container) Container {
	// Remove leading slash from container name
	name := strings.TrimPrefix(ctn.Names[0], "/")

	// Extract compose service name from labels
	service := ctn.Labels["com.docker.compose.service"]
	project := ctn.Labels["com.docker.compose.project"]

	// Convert port mappings
	ports := make([]PortMapping, 0, len(ctn.Ports))
	for _, port := range ctn.Ports {
		if port.PublicPort != 0 {
			ports = append(ports, PortMapping{
				Host:      fmt.Sprintf("%d", port.PublicPort),
				Container: fmt.Sprintf("%d/%s", port.PrivatePort, port.Type),
			})
		}
	}

	return Container{
		ID:      ctn.ID,
		Name:    name,
		Project: project,
		Service: service,
		Image:   ctn.Image,
		Status:  ctn.Status,
		State:   ctn.State,
		Ports:   ports,
	}
}

// GetContainer returns a single container by ID
func (c *Client) GetContainer(ctx context.Context, id string) (*Container, error) {
	ctn, err := c.cli.ContainerInspect(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to inspect container: %w", err)
	}

	// Convert to our Container type
	project := ctn.Config.Labels["com.docker.compose.project"]
	service := ctn.Config.Labels["com.docker.compose.service"]

	// Get ports
	ports := make([]PortMapping, 0)
	for port, bindings := range ctn.NetworkSettings.Ports {
		for _, binding := range bindings {
			if binding.HostPort != "" {
				ports = append(ports, PortMapping{
					Host:      binding.HostPort,
					Container: string(port),
				})
			}
		}
	}

	container := &Container{
		ID:      ctn.ID,
		Name:    strings.TrimPrefix(ctn.Name, "/"),
		Project: project,
		Service: service,
		Image:   ctn.Config.Image,
		Status:  ctn.State.Status,
		State:   ctn.State.Status,
		Ports:   ports,
	}

	return container, nil
}

// ContainerStats represents resource usage statistics for a container
type ContainerStats struct {
	CPUPercentage    float64 `json:"cpu_percentage"`
	MemoryPercentage float64 `json:"memory_percentage"`
	PIDs             int     `json:"pids"`
}

// GetStats returns resource usage statistics for a container
func (c *Client) GetStats(ctx context.Context, containerID string) (*ContainerStats, error) {
	stats, err := c.cli.ContainerStats(ctx, containerID, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get container stats: %w", err)
	}
	defer stats.Body.Close()

	var statsJSON types.StatsJSON
	if err := json.NewDecoder(stats.Body).Decode(&statsJSON); err != nil {
		return nil, fmt.Errorf("failed to decode stats: %w", err)
	}

	// Calculate CPU percentage
	cpuDelta := float64(statsJSON.CPUStats.CPUUsage.TotalUsage - statsJSON.PreCPUStats.CPUUsage.TotalUsage)
	systemDelta := float64(statsJSON.CPUStats.SystemUsage - statsJSON.PreCPUStats.SystemUsage)
	cpuPercentage := 0.0
	if systemDelta > 0 && cpuDelta > 0 {
		cpuPercentage = (cpuDelta / systemDelta) * float64(len(statsJSON.CPUStats.CPUUsage.PercpuUsage)) * 100.0
	}

	// Calculate memory percentage
	memoryPercentage := 0.0
	if statsJSON.MemoryStats.Limit > 0 {
		memoryPercentage = float64(statsJSON.MemoryStats.Usage) / float64(statsJSON.MemoryStats.Limit) * 100.0
	}

	// Get PID count
	pids := int(statsJSON.PidsStats.Current)

	return &ContainerStats{
		CPUPercentage:    cpuPercentage,
		MemoryPercentage: memoryPercentage,
		PIDs:             pids,
	}, nil
}

// StartContainer starts a container
func (c *Client) StartContainer(ctx context.Context, id string) error {
	return c.cli.ContainerStart(ctx, id, container.StartOptions{})
}

// StopContainer stops a container
func (c *Client) StopContainer(ctx context.Context, id string) error {
	return c.cli.ContainerStop(ctx, id, container.StopOptions{})
}

// RestartContainer restarts a container
func (c *Client) RestartContainer(ctx context.Context, id string) error {
	return c.cli.ContainerRestart(ctx, id, container.StopOptions{})
}
