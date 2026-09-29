import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Droplets,
  CloudRain,
  IndianRupee,
  Users,
  ShieldCheck,
  Settings,
  Info,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const SustainabilityPage: React.FC = () => {
  const { showToast } = useNotification();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [factorsForm, setFactorsForm] = useState({
    co2FactorPerKg: 2.5,
    waterFactorPerKg: 450.0,
    costPerKgInr: 120.0,
    mealConversionKg: 2.5,
    methodologyNote: ''
  });

  const loadSustainabilityData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/analytics/sustainability');
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.factors) {
          setFactorsForm({
            co2FactorPerKg: res.data.factors.co2FactorPerKg,
            waterFactorPerKg: res.data.factors.waterFactorPerKg,
            costPerKgInr: res.data.factors.costPerKgInr,
            mealConversionKg: res.data.factors.mealConversionKg,
            methodologyNote: res.data.factors.methodologyNote
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSustainabilityData();
  }, []);

  const handleUpdateFactors = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/analytics/factors', factorsForm);
      if (res.success) {
        showToast('Sustainability impact factors updated', 'success', 'Factors Updated');
        setShowConfigModal(false);
        loadSustainabilityData();
      }
    } catch (err: any) {
      showToast('Failed to update factors', 'error', 'Error');
    }
  };

  const kpis = data?.kpis || {
    totalFoodRescuedKg: 128,
    wastePreventedKg: 236,
    mealsEnabled: 320,
    estimatedCo2AvoidanceKg: 320.0,
    estimatedWaterSavingsLiters: 57600,
    estimatedCostSavingsInr: 28320
  };

  const timeline = data?.trendTimeline || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-emerald-600" />
            <span>Sustainability & Environmental Impact Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quantifiable carbon avoidance, water conservation, and nutritional relief metrics with auditable methodology
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Configure Conversion Factors</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Food Rescued</span>
          <div className="text-2xl font-black text-emerald-600">{kpis.totalFoodRescuedKg} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Surplus redistributed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Waste Prevented</span>
          <div className="text-2xl font-black text-teal-600">{kpis.wastePreventedKg} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Direct kitchen avoidance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Meals Enabled</span>
          <div className="text-2xl font-black text-indigo-600">{kpis.mealsEnabled}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">@ 2.5 meals/kg portion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CO₂ Avoidance</span>
          <div className="text-2xl font-black text-emerald-700">{kpis.estimatedCo2AvoidanceKg} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Calculated emissions saved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Water Conserved</span>
          <div className="text-2xl font-black text-blue-600">{kpis.estimatedWaterSavingsLiters.toLocaleString('en-IN')} L</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Agricultural embedded water</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cost Savings</span>
          <div className="text-2xl font-black text-slate-900">₹{kpis.estimatedCostSavingsInr.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Operational food recovery</span>
        </div>
      </div>

      {/* Transparent Methodology Panel */}
      <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 text-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-950 font-bold">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Scientific Calculation Methodology & Estimation Transparency</span>
        </div>
        <p className="text-emerald-900 leading-relaxed">
          {data?.methodologyDisclaimer || 'Impact metrics are estimates calculated using configurable conversion factors. Administrators can update these factors based on approved datasets or organizational methodology.'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
            <span className="text-slate-500 block">Carbon Factor:</span>
            <span className="font-bold text-emerald-800">{factorsForm.co2FactorPerKg} kg CO₂ eq / kg food</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
            <span className="text-slate-500 block">Water Factor:</span>
            <span className="font-bold text-blue-800">{factorsForm.waterFactorPerKg} Liters / kg food</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
            <span className="text-slate-500 block">Portion Ratio:</span>
            <span className="font-bold text-slate-800">{factorsForm.mealConversionKg} meals / kg food</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
            <span className="text-slate-500 block">Cost Valuation:</span>
            <span className="font-bold text-slate-800">₹{factorsForm.costPerKgInr} / kg food</span>
          </div>
        </div>
      </div>

      {/* Sustainability Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historical Environmental Impact Trend</h3>
            <p className="text-xs text-slate-500">Cumulative CO₂ avoidance (kg) and meals redistributed over 14 days</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="co2AvoidedKg" name="Estimated CO₂ Avoided (kg)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCo2)" />
              <Area type="monotone" dataKey="meals" name="Meals Distributed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMeals)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Configure Factors Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Configure Impact Conversion Factors</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFactors} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CO₂ Factor (kg CO₂ eq per kg food)</label>
                <input
                  type="number"
                  step="0.1"
                  value={factorsForm.co2FactorPerKg}
                  onChange={(e) => setFactorsForm({ ...factorsForm, co2FactorPerKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Water Factor (Liters per kg food)</label>
                <input
                  type="number"
                  value={factorsForm.waterFactorPerKg}
                  onChange={(e) => setFactorsForm({ ...factorsForm, waterFactorPerKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cost Savings Valuation (₹ per kg food)</label>
                <input
                  type="number"
                  value={factorsForm.costPerKgInr}
                  onChange={(e) => setFactorsForm({ ...factorsForm, costPerKgInr: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meal Conversion Factor (meals per kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={factorsForm.mealConversionKg}
                  onChange={(e) => setFactorsForm({ ...factorsForm, mealConversionKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20"
                >
                  Save Methodology Factors
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
