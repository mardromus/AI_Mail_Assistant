import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, ClockIcon, RefreshCwIcon, WifiIcon, WifiOffIcon } from './icons';

interface ServiceStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'loading';
  lastChecked: Date;
  error?: string;
}

interface StatusDashboardProps {
  services: ServiceStatus[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({ services, onRefresh, isRefreshing }) => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!isRefreshing) {
      setLastRefresh(new Date());
    }
  }, [isRefreshing]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <WifiOffIcon className="h-5 w-5 text-slate-400" />;
      case 'error':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <WifiIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'disconnected':
        return 'text-slate-500 dark:text-slate-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'loading':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getOverallStatus = () => {
    const connectedCount = services.filter(s => s.status === 'connected').length;
    const errorCount = services.filter(s => s.status === 'error').length;
    const loadingCount = services.filter(s => s.status === 'loading').length;

    if (loadingCount > 0) return 'loading';
    if (errorCount > 0) return 'error';
    if (connectedCount === services.length) return 'connected';
    return 'disconnected';
  };

  const overallStatus = getOverallStatus();
  const connectedServices = services.filter(s => s.status === 'connected').length;
  const totalServices = services.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Status</h3>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overall Status */}
      <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            <span className={`font-medium ${getStatusColor(overallStatus)}`}>
              {overallStatus === 'loading' ? 'Checking Services...' : 
               overallStatus === 'connected' ? 'All Systems Operational' :
               overallStatus === 'error' ? 'Some Services Unavailable' :
               'Services Disconnected'}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {connectedServices}/{totalServices} connected
          </span>
        </div>
        {overallStatus === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Some services are experiencing issues. Check individual service status below.
          </p>
        )}
      </div>

      {/* Individual Services */}
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-center space-x-3">
              {getStatusIcon(service.status)}
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{service.name}</p>
                <p className={`text-sm ${getStatusColor(service.status)}`}>
                  {getStatusText(service.status)}
                </p>
                {service.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {service.error}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last checked: {service.lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Last Refresh Time */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default StatusDashboard;
