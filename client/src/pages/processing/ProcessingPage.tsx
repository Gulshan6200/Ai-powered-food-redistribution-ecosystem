import React, { useState, useEffect } from 'react';
import {
  Factory,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Wrench,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const ProcessingPage: React.FC = () => {
  const { showToast } = useNotification();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Downtime Modal State
  const [showDowntimeModal, setShowDowntimeModal] = useState<boolean>(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [downtimeForm, setDowntimeForm] = useState({
    reason: 'Unscheduled cleaning and seal recalibration',
    durationMinutes: 45,
    notes: 'Seal pressure normalized following steam test'
  });

  const loadProcessingData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/processing/overview');
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.machines?.length > 0 && !selectedMachineId) {
          setSelectedMachineId(res.data.machines[0].id);
        }
      }
    } catch (err: any) {
      showToast('Failed to load processing overview', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcessingData();
  }, []);

  const handleRecordDowntime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) return;

    try {
      const res = await api.post(`/processing/machines/${selectedMachineId}/downtime`, downtimeForm);
      if (res.success) {
        showToast('Machine downtime recorded successfully', 'success', 'Downtime Logged');
        setShowDowntimeModal(false);
        loadProcessingData();
      }
    } catch (err: any) {
      showToast('Failed to record downtime', 'error', 'Error');
    }
  };

  const kpis = data?.kpis || {
    totalInputKg: 3500,
    totalOutputKg: 3180,
    totalWasteKg: 320,
    rawMaterialEfficiencyPct: 90.8,
    wastePercentage: 9.1,
    totalDowntimeHours: 50.5,
    energyIntensityKwhKg: 0.15
  };

  const batches = data?.batches || [];
  const machines = data?.machines || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Factory className="w-6 h-6 text-emerald-600" />
            <span>Food Processing Unit Efficiency Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Raw material transformation, line efficiency, downtime monitoring, and energy intensity benchmarks
          </p>
        </div>

        <button
          onClick={() => setShowDowntimeModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/20 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Wrench className="w-4 h-4" />
          <span>Record Machine Downtime</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Raw Input Volume</span>
          <div className="text-2xl font-black text-slate-900">{kpis.totalInputKg.toLocaleString('en-IN')} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Karnataka Agro Grade-A</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Packaged Output</span>
          <div className="text-2xl font-black text-emerald-600">{kpis.totalOutputKg.toLocaleString('en-IN')} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Retort packaging lines</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Conversion Efficiency</span>
          <div className="text-2xl font-black text-blue-600">{kpis.rawMaterialEfficiencyPct}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Exceeds 88% target</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Process By-Product Waste</span>
          <div className="text-2xl font-black text-amber-600">{kpis.totalWasteKg} kg</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Diverted to organic composting</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Energy Intensity</span>
          <div className="text-2xl font-black text-indigo-600">{kpis.energyIntensityKwhKg} <span className="text-xs font-normal">kWh/kg</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">Electric boiler & steam retorts</span>
        </div>
      </div>

      {/* Machine Status Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Processing Floor Machine Telemetry</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machines.map((machine: any) => (
            <div
              key={machine.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{machine.machineCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    machine.status === 'RUNNING'
                      ? 'bg-emerald-100 text-emerald-800'
                      : machine.status === 'IDLE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {machine.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{machine.name}</h4>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Runtime:</span>
                    <span className="font-bold text-slate-800">{machine.totalRuntimeHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Downtime:</span>
                    <span className="font-bold text-rose-600">{machine.totalDowntimeHours} hrs</span>
                  </div>
                </div>
              </div>

              {machine.downtimes?.length > 0 && (
                <div className="mt-4 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Latest Event:</span> {machine.downtimes[0].reason} ({machine.downtimes[0].durationMinutes}m)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Production Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Transformation Batches</h3>
          <p className="text-xs text-slate-500">Raw input vs packaged yield reconciliation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Batch ID</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Raw Input (kg)</th>
                <th className="py-3.5 px-4">Output (kg)</th>
                <th className="py-3.5 px-4">By-Product (kg)</th>
                <th className="py-3.5 px-4">Efficiency</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {batches.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{b.productName}</td>
                  <td className="py-3.5 px-4">{b.rawInputKg}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{b.outputKg}</td>
                  <td className="py-3.5 px-4 text-slate-500">{b.wasteKg}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{b.efficiencyPct}%</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Downtime Modal */}
      {showDowntimeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Record Machine Downtime</h3>
              <button
                onClick={() => setShowDowntimeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordDowntime} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Machine</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                >
                  {machines.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.machineCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Downtime</label>
                <select
                  value={downtimeForm.reason}
                  onChange={(e) => setDowntimeForm({ ...downtimeForm, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                >
                  <option value="Mechanical breakdown & seal recalibration">Mechanical breakdown & seal recalibration</option>
                  <option value="Unscheduled CIP cleaning & sterilization">Unscheduled CIP cleaning & sterilization</option>
                  <option value="Power fluctuation / Boiler temperature cycle">Power fluctuation / Boiler temperature cycle</option>
                  <option value="Operator shift handover & preventive audit">Operator shift handover & preventive audit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={downtimeForm.durationMinutes}
                  onChange={(e) => setDowntimeForm({ ...downtimeForm, durationMinutes: Number(e.target.value) })}
                  required
                  min={5}
                  max={480}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Notes</label>
                <input
                  type="text"
                  value={downtimeForm.notes}
                  onChange={(e) => setDowntimeForm({ ...downtimeForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDowntimeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md shadow-amber-600/20"
                >
                  Log Downtime Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
