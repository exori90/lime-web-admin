// Server monitoring and orchestration service
import { orchestratorService } from '@/services/api';
import type { ApiResponse } from '@/services/api';

// Define monitoring-related types
export interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  lastCheck: string;
  region: string;
  version?: string;
}

export interface ServerMetrics {
  serverId: string;
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  connections: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  serverId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: string;
  resolvedAt?: string;
}

export interface ServersListResponse {
  servers: ServerStatus[];
  total: number;
  page: number;
  limit: number;
}

export interface MetricsResponse {
  metrics: ServerMetrics[];
  total: number;
  timeRange: {
    from: string;
    to: string;
  };
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  limit: number;
}

// Orchestrator service class
export class OrchestratorService {
  // Get all servers with status
  static async getServers(params?: {
    page?: number;
    limit?: number;
    status?: ServerStatus['status'];
    region?: string;
  }): Promise<ApiResponse<ServersListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.region) queryParams.append('region', params.region);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/servers?${queryString}` : '/servers';
    
    return orchestratorService.get<ServersListResponse>(endpoint);
  }

  // Get server by ID
  static async getServerById(id: string): Promise<ApiResponse<ServerStatus>> {
    return orchestratorService.get<ServerStatus>(`/servers/${id}`);
  }

  // Get server metrics
  static async getServerMetrics(
    serverId: string, 
    params?: {
      from?: string;
      to?: string;
      interval?: '5m' | '15m' | '1h' | '6h' | '24h';
    }
  ): Promise<ApiResponse<MetricsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.interval) queryParams.append('interval', params.interval);
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/servers/${serverId}/metrics?${queryString}` 
      : `/servers/${serverId}/metrics`;
    
    return orchestratorService.get<MetricsResponse>(endpoint);
  }

  // Restart server
  static async restartServer(serverId: string): Promise<ApiResponse<{ message: string }>> {
    return orchestratorService.post<{ message: string }>(`/servers/${serverId}/restart`);
  }

  // Update server status
  static async updateServerStatus(
    serverId: string, 
    status: ServerStatus['status']
  ): Promise<ApiResponse<ServerStatus>> {
    return orchestratorService.patch<ServerStatus>(`/servers/${serverId}`, { status });
  }

  // Get alerts
  static async getAlerts(params?: {
    page?: number;
    limit?: number;
    severity?: Alert['severity'];
    status?: Alert['status'];
    serverId?: string;
  }): Promise<ApiResponse<AlertsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.serverId) queryParams.append('serverId', params.serverId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/alerts?${queryString}` : '/alerts';
    
    return orchestratorService.get<AlertsResponse>(endpoint);
  }

  // Acknowledge alert
  static async acknowledgeAlert(alertId: string): Promise<ApiResponse<Alert>> {
    return orchestratorService.patch<Alert>(`/alerts/${alertId}`, { 
      status: 'acknowledged' 
    });
  }

  // Resolve alert
  static async resolveAlert(alertId: string): Promise<ApiResponse<Alert>> {
    return orchestratorService.patch<Alert>(`/alerts/${alertId}`, { 
      status: 'resolved' 
    });
  }

  // Get alert rules
  static async getAlertRules(): Promise<ApiResponse<AlertRule[]>> {
    return orchestratorService.get<AlertRule[]>('/alerts/rules');
  }

  // Create alert rule
  static async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): Promise<ApiResponse<AlertRule>> {
    return orchestratorService.post<AlertRule>('/alerts/rules', rule);
  }

  // Update alert rule
  static async updateAlertRule(
    ruleId: string, 
    updates: Partial<Omit<AlertRule, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<AlertRule>> {
    return orchestratorService.patch<AlertRule>(`/alerts/rules/${ruleId}`, updates);
  }

  // Delete alert rule
  static async deleteAlertRule(ruleId: string): Promise<ApiResponse<void>> {
    return orchestratorService.delete<void>(`/alerts/rules/${ruleId}`);
  }

  // Get system overview/dashboard data
  static async getSystemOverview(): Promise<ApiResponse<{
    totalServers: number;
    onlineServers: number;
    offlineServers: number;
    activeAlerts: number;
    criticalAlerts: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    totalUptime: number;
  }>> {
    return orchestratorService.get('/dashboard/overview');
  }

  // Get deployment status
  static async getDeployments(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'running' | 'completed' | 'failed';
  }): Promise<ApiResponse<{
    deployments: Array<{
      id: string;
      serverId: string;
      version: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      startedAt: string;
      completedAt?: string;
      logs?: string[];
    }>;
    total: number;
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/deployments?${queryString}` : '/deployments';
    
    return orchestratorService.get(endpoint);
  }

  // Deploy to server
  static async deployToServer(
    serverId: string, 
    version: string
  ): Promise<ApiResponse<{ deploymentId: string; message: string }>> {
    return orchestratorService.post(`/servers/${serverId}/deploy`, { version });
  }

  // Get active sessions
  static async getSessions(): Promise<ApiResponse<string[]>> {
    return orchestratorService.get<string[]>('/sessions');
  }

  // Test orchestrator connection
  static async testConnection(): Promise<ApiResponse<void>> {
    return orchestratorService.get<void>('/tests');
  }
}

// Export individual methods for convenience
export const {
  getServers,
  getServerById,
  getServerMetrics,
  restartServer,
  updateServerStatus,
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getSystemOverview,
  getDeployments,
  deployToServer,
  getSessions,
  testConnection,
} = OrchestratorService;