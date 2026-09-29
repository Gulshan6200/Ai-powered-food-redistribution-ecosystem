import React, { useState, useEffect } from 'react';
import {
  Utensils,
  TrendingDown,
  HeartHandshake,
  ShieldCheck,
  IndianRupee,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/dashboard/summary');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    todayPreparedKg: 1240,
    predictedSurplusKg: 86,
    foodRescuedKg: 64,
    wastePreventedKg: 42,
    estimatedCostSavedInr: 18450,
    mealsRedistributed: 286
  };

  const kpiCards = [
    {
      title: "Today's Prepared",
      value: `${kpis.todayPreparedKg.toLocaleString('en-IN')} kg`,
      subtext: 'Central Kitchen Batch 01',
      icon: Utensils,
      color: 'text-slate-900',
      bg: 'bg-white',
      accent: 'bg-emerald-500'
    },
    {
      title: 'Predicted Surplus',
      value: `${kpis.predictedSurplusKg} kg`,
      subtext: 'Ready for allocation',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-white',
      accent: 'bg-amber-500',
      action: () => onNavigate('/surplus')
    },
    {
      title: 'Food Rescued',
      value: `${kpis.foodRescuedKg} kg`,
      subtext: 'Delivered to verified NGOs',
      icon: HeartHandshake,
      color: 'text-emerald-600',
      bg: 'bg-white',
      accent: 'bg-emerald-600',
      action: () => onNavigate('/redistribution')
    },
    {
      title: 'Waste Prevented',
      value: `${kpis.wastePreventedKg} kg`,
      subtext: 'Calculated vs baseline',
      icon: TrendingDown,
      color: 'text-teal-600',
      bg: 'bg-white',
      accent: 'bg-teal-500',
      action: () => onNavigate('/analytics/waste')
    },
    {
      title: 'Cost Saved',
      value: `₹${kpis.estimatedCostSavedInr.toLocaleString('en-IN')}`,
      subtext: 'Configured @ ₹120/kg',
      icon: IndianRupee,
      color: 'text-blue-600',
      bg: 'bg-white',
      accent: 'bg-blue-500',
      action: () => onNavigate('/sustainability')
    },
    {
      title: 'Meals Redistributed',
      value: `${kpis.mealsRedistributed}`,
      subtext: 'Enriched community portions',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-white',
      accent: 'bg-indigo-500',
      action: () => onNavigate('/reports')
    }
  ];

  const prodVsCons = data?.charts?.prodVsConsTrend || [];
  const categoryBreakdown = data?.charts?.categoryBreakdown || [];
  const statusDonut = data?.charts?.statusDonut || [];
  const alerts = data?.alerts || [];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {user?.fullName || 'Kitchen Manager'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time food intelligence & redistribution control center • Apex Central Kitchen
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={() => onNavigate('/forecast')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-semibold flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Demand Forecast</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.action}
              className={`p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all ${
                card.action ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
              } ${card.bg}`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${card.accent}`} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`text-xl font-extrabold tracking-tight ${card.color}`}>{card.value}</div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">{card.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Critical Alerts Banner (Clickable) */}
      {alerts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Operational Attention Required ({alerts.length})</span>
            </div>
            <button
              onClick={() => onNavigate('/alerts')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.slice(0, 3).map((alert: any) => (
              <div
                key={alert.id}
                onClick={() => onNavigate(alert.targetRoute || '/alerts')}
                className="p-3 bg-white/90 rounded-xl border border-amber-200/60 cursor-pointer hover:bg-white hover:shadow-sm transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className="text-amber-800 uppercase">{alert.type}</span>
                  <span className="text-rose-600 font-extrabold">{alert.severity}</span>
                </div>
                <p className="font-semibold text-slate-900 line-clamp-1">{alert.title}</p>
                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Production vs Consumption & Waste Trend */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart A: Production vs Consumption */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Food Prepared vs Consumed</h3>
                <p className="text-xs text-slate-500">7-day institutional kitchen throughput & gap tracking</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Prepared (kg)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Consumed (kg)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prodVsCons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="production" name="Prepared (kg)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="consumption" name="Consumed (kg)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Waste Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">7-Day Waste Trend (kg)</h3>
                <p className="text-xs text-slate-500">Continuous reduction through predictive portioning</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                -58.7% vs Baseline
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prodVsCons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="waste" name="Waste (kg)" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Category Breakdown & Status Donut */}
        <div className="lg:col-span-4 space-y-6">
          {/* Chart D: Surplus by Food Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Surplus by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution across current active batches</p>

            <div className="space-y-3">
              {categoryBreakdown.map((cat: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="font-bold text-slate-900">{cat.value} kg</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (cat.value / 120) * 100)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart E: Redistribution Status Donut */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Redistribution Status</h3>
            <p className="text-xs text-slate-500 mb-2">Live lifecycle of today's surplus volume</p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDonut.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.5rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-[11px]">
              {statusDonut.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
