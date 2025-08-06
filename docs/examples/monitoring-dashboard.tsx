// Example monitoring dashboard component using the Orchestrator service
'use client';

import React, { useState, useEffect } from 'react';
import { OrchestratorService, type ServerStatus, type Alert } from '@/services/monitoring/orchestratorService';
import { useQuery, useMutation } from '@/services/hooks/useApi';
import { handleApiError } from '@/services/utils/apiHelpers';

// Example: Server Status Dashboard
export const ServerStatusDashboard: React.FC = () => {
  const {
    data: serversData,
    loading: serversLoading,
    error: serversError,
    refetch: refetchServers,
  } = useQuery(
    () => OrchestratorService.getServers({ page: 1, limit: 20 }),
    {
      immediate: true,
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        console.error('Failed to fetch servers:', handleApiError(error));
      },
    }
  );

  const {
    data: overviewData,
    loading: overviewLoading,
  } = useQuery(
    () => OrchestratorService.getSystemOverview(),
    {
      immediate: true,
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const {
    execute: restartServer,
    loading: restarting,
  } = useMutation(
    (serverId: string) => OrchestratorService.restartServer(serverId),
    {
      onSuccess: () => {
        refetchServers(); // Refresh server list after restart
      },
      onError: (error) => {
        alert(`Failed to restart server: ${handleApiError(error)}`);
      },
    }
  );

  const getStatusColor = (status: ServerStatus['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (serversLoading || overviewLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (serversError) {
    return (
      <div className="p-6 text-red-600">
        Error loading servers: {handleApiError(serversError)}
        <button 
          onClick={() => refetchServers()} 
          className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* System Overview */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Servers</h3>
            <p className="text-2xl font-bold text-gray-900">{overviewData.totalServers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Online</h3>
            <p className="text-2xl font-bold text-green-600">{overviewData.onlineServers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
            <p className="text-2xl font-bold text-yellow-600">{overviewData.activeAlerts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Critical Alerts</h3>
            <p className="text-2xl font-bold text-red-600">{overviewData.criticalAlerts}</p>
          </div>
        </div>
      )}

      {/* Servers List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Servers ({serversData?.total || 0})</h2>
          <button 
            onClick={() => refetchServers()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Server</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serversData?.servers.map((server) => (
                <tr key={server.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{server.name}</div>
                      <div className="text-sm text-gray-500">{server.id}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{server.region}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{server.cpu}%</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{server.memory}%</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {Math.floor(server.uptime / 86400)}d {Math.floor((server.uptime % 86400) / 3600)}h
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => restartServer(server.id)}
                      disabled={restarting || server.status === 'maintenance'}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {restarting ? 'Restarting...' : 'Restart'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Example: Alerts Dashboard
export const AlertsDashboard: React.FC = () => {
  const [filter, setFilter] = useState<{
    severity?: Alert['severity'];
    status?: Alert['status'];
  }>({});

  const {
    data: alertsData,
    loading,
    error,
    refetch,
  } = useQuery(
    () => OrchestratorService.getAlerts({ 
      page: 1, 
      limit: 50,
      ...filter 
    }),
    {
      immediate: true,
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  const {
    execute: acknowledgeAlert,
    loading: acknowledging,
  } = useMutation(
    (alertId: string) => OrchestratorService.acknowledgeAlert(alertId),
    {
      onSuccess: () => {
        refetch(); // Refresh alerts after acknowledging
      },
    }
  );

  const {
    execute: resolveAlert,
    loading: resolving,
  } = useMutation(
    (alertId: string) => OrchestratorService.resolveAlert(alertId),
    {
      onSuccess: () => {
        refetch(); // Refresh alerts after resolving
      },
    }
  );

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="p-6">Loading alerts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading alerts: {handleApiError(error)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filter.severity || ''}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                severity: e.target.value as Alert['severity'] || undefined 
              }))}
              className="border rounded px-3 py-2"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                status: e.target.value as Alert['status'] || undefined 
              }))}
              className="border rounded px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alerts ({alertsData?.total || 0})</h2>
        
        {alertsData?.alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{alert.message}</h3>
                <p className="text-sm text-gray-600">
                  Server: {alert.serverId} • Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                  {alert.resolvedAt && ` • Resolved: ${new Date(alert.resolvedAt).toLocaleString()}`}
                </p>
              </div>
              
              {alert.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    disabled={acknowledging}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {acknowledging ? 'Acknowledging...' : 'Acknowledge'}
                  </button>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    disabled={resolving}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {resolving ? 'Resolving...' : 'Resolve'}
                  </button>
                </div>
              )}
              
              {alert.status === 'acknowledged' && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  disabled={resolving}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {resolving ? 'Resolving...' : 'Resolve'}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {alertsData?.alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No alerts found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};