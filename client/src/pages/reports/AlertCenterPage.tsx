import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Radio,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Alert } from '../../types';

interface AlertCenterPageProps {
  onNavigate: (path: string) => void;
}

export const AlertCenterPage: React.FC<AlertCenterPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/alerts', {
        type: typeFilter,
        severity: severityFilter,
        search
      });
      if (res.success && res.alerts) {
        setAlerts(res.alerts);
      }
    } catch (err: any) {
      showToast('Failed to load alerts', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [typeFilter, severityFilter, search]);

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await api.put(`/alerts/${id}/resolve`);
      if (res.success) {
        showToast('Alert resolved', 'success', 'Resolved');
        loadAlerts();
      }
    } catch (err: any) {
      showToast('Failed to resolve alert', 'error', 'Error');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold animate-pulse">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">{severity}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Operational Alert Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time threshold triggers from IoT cold-storage telemetry, near-expiry inventory, and redistribution deadlines
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="">All Alert Types</option>
            <option value="EXPIRY">Near Expiry</option>
            <option value="TEMPERATURE">Temperature Excursion</option>
            <option value="SURPLUS">Surplus Window</option>
            <option value="QUALITY">Quality Assessment</option>
            <option value="LOGISTICS">Logistics Fleet</option>
            <option value="FORECAST">Forecast Opportunity</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active alerts found matching current filters.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.isResolved ? 'opacity-60 border-slate-200' : 'border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-[10px] font-bold uppercase text-slate-400">{alert.type}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(alert.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{alert.message}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {alert.targetRoute && (
                  <button
                    onClick={() => onNavigate(alert.targetRoute!)}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!alert.isResolved ? (
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
