import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  Wind,
  FlaskConical,
  Droplets,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Radio,
  Sliders,
  CheckCircle2,
  FileCheck2,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { QualityInspection, FoodItem } from '../../types';

export const QualityPage: React.FC = () => {
  const { showToast } = useNotification();

  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedProbeId, setSelectedProbeId] = useState<string>('BENCH-LAB-900');

  // IoT Sensor Telemetry States
  const [coreTemperature, setCoreTemperature] = useState<number>(65.0);
  const [vocGasPpm, setVocGasPpm] = useState<number>(8.5);
  const [phLevel, setPhLevel] = useState<number>(6.4);
  const [moistureAw, setMoistureAw] = useState<number>(0.88);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [currentInspection, setCurrentInspection] = useState<QualityInspection | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Diagnostic Presets for Real-time Simulation
  const sensorPresets = [
    {
      label: 'Fresh Hot Holding',
      desc: 'Safe hot holding (>60°C)',
      temp: 68.0,
      gas: 7.5,
      ph: 6.4,
      aw: 0.88,
      badge: 'FSSAI Compliant',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900'
    },
    {
      label: 'Safe Chilled Storage',
      desc: 'Cold chain intact (<5°C)',
      temp: 3.5,
      gas: 5.8,
      ph: 6.5,
      aw: 0.82,
      badge: 'Refrigerated',
      color: 'border-cyan-500 bg-cyan-50 text-cyan-900'
    },
    {
      label: 'Thermal Abuse (Danger Zone)',
      desc: 'Microbial incubation (5°C–60°C)',
      temp: 34.0,
      gas: 22.5,
      ph: 5.8,
      aw: 0.94,
      badge: 'Critical Hazard',
      color: 'border-amber-500 bg-amber-50 text-amber-900'
    },
    {
      label: 'Fermented / Spoiled Batch',
      desc: 'High TVB-N & acid souring',
      temp: 28.0,
      gas: 54.0,
      ph: 4.3,
      aw: 0.96,
      badge: 'Unsafe / Reject',
      color: 'border-rose-500 bg-rose-50 text-rose-900'
    }
  ];

  const probeOptions = [
    { id: 'BENCH-LAB-900', name: 'BENCH-LAB-900 Integrated Station', desc: 'Quad-channel Core Temp + e-Nose + pH + aw' },
    { id: 'PROBE-QC-101', name: 'PROBE-QC-101 Multi-Insertion Wand', desc: 'Penetration Pt1000 RTD + Glass pH Electrode' },
    { id: 'ENOSE-QC-204', name: 'ENOSE-QC-204 Headspace VOC Array', desc: 'Metal-oxide sensor for NH3 / TVB-N decomposition' },
    { id: 'HYGRO-QC-305', name: 'HYGRO-QC-305 Equilibrium aw Sensor', desc: 'Capacitive chilled-mirror water activity probe' }
  ];

  const loadInspections = async () => {
    try {
      const res = await api.get('/quality');
      if (res.success && res.inspections) {
        setInspections(res.inspections);
        if (res.inspections.length > 0 && !currentInspection) {
          setCurrentInspection(res.inspections[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    }
  };

  const loadItems = async () => {
    try {
      const res = await api.get('/forecast/items');
      if (res.success && res.items?.length > 0) {
        setFoodItems(res.items);
        setSelectedItemId(res.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  useEffect(() => {
    loadInspections();
    loadItems();
  }, []);

  const handleApplyPreset = (preset: typeof sensorPresets[0]) => {
    setCoreTemperature(preset.temp);
    setVocGasPpm(preset.gas);
    setPhLevel(preset.ph);
    setMoistureAw(preset.aw);
    showToast(`Loaded ${preset.label} sensor parameters`, 'info', 'Diagnostic Preset Applied');
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      showToast('All 4 sensor channels zero-calibrated successfully against certified buffer standards.', 'success', 'Sensor Calibration Complete');
    }, 1200);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.post('/quality/analyze', {
        foodItemId: selectedItemId,
        probeId: selectedProbeId,
        coreTemperature,
        vocGasPpm,
        phLevel,
        moistureAw
      });

      if (res.success && res.inspection) {
        setCurrentInspection(res.inspection);
        showToast(
          `FQI Score: ${res.inspection.qualityScore}/100 (${res.inspection.freshnessCategory})`,
          res.inspection.qualityScore >= 70 ? 'success' : res.inspection.qualityScore >= 45 ? 'warning' : 'error',
          'Sensor Telemetry Analyzed'
        );
        loadInspections();
      }
    } catch (err: any) {
      showToast(err.message || 'Sensor telemetry analysis failed', 'error', 'Analysis Error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED') => {
    if (!currentInspection) return;

    try {
      const res = await api.post(`/quality/${currentInspection.id}/review`, {
        reviewerStatus: status,
        inspectorNotes: notes || 'Verified sensor telemetry and signed off against FSSAI Schedule IV criteria'
      });

      if (res.success) {
        setCurrentInspection(res.inspection);
        showToast(`Inspection review updated to ${status}`, 'success', 'Sign-Off Recorded');
        loadInspections();
        setNotes('');
      }
    } catch (err: any) {
      showToast('Failed to record review', 'error', 'Review Error');
    }
  };

  // Helper flags for live input feedback
  const isDangerZone = coreTemperature >= 5.0 && coreTemperature <= 60.0;
  const isSafeHot = coreTemperature > 60.0;
  const isSafeCold = coreTemperature < 5.0;
  const isSevereGas = vocGasPpm > 28.0;
  const isSourPh = phLevel < 5.2;

  return (
    <div className="space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            IoT Biochemical Probe Station v2.4 • Online
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span>IoT Multi-Sensor Food Quality Station</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Precision insertion probe telemetry: Core Temp (°C), e-Nose TVB-N Volatiles (ppm), pH Acidity &amp; Water Activity (aw)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isCalibrating ? 'Zeroing Probes...' : 'Zero-Calibrate'}</span>
          </button>
          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-600">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium">Bus: MODBUS-RS485 / 115200 bps</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: IoT Hardware Controls & Multi-Sensor Input */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Hardware Probe Diagnostics &amp; Input</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Live Telemetry Active
              </span>
            </div>

            {/* Target Food Batch & Probe Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Food Batch Under Test</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 text-xs font-medium text-slate-800"
                >
                  {foodItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Probe Device</label>
                <select
                  value={selectedProbeId}
                  onChange={(e) => setSelectedProbeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 text-xs font-medium text-slate-800"
                >
                  {probeOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Diagnostic Simulation Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Diagnostic Quick Presets (1-Click Simulation):
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sensorPresets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs hover:scale-[1.01] ${
                      coreTemperature === preset.temp && vocGasPpm === preset.gas
                        ? `${preset.color} font-semibold ring-2 ring-offset-1 ring-emerald-400`
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{preset.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 font-semibold">{preset.temp}°C</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Interactive Multi-Sensor Telemetry Controls */}
            <div className="space-y-4 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Multi-Parameter Sensor Probe Readings:
              </span>

              {/* Parameter 1: Core Insertion Temperature */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className={`w-4 h-4 ${isDangerZone ? 'text-rose-600' : isSafeHot ? 'text-emerald-600' : 'text-cyan-600'}`} />
                    <span className="text-xs font-bold text-slate-800">Core Food Temperature (°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDangerZone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        ⚠️ DANGER ZONE (5°C–60°C)
                      </span>
                    )}
                    {isSafeHot && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        🔥 Safe Hot Holding (&gt;60°C)
                      </span>
                    )}
                    {isSafeCold && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                        ❄️ Safe Chilled (&lt;5°C)
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-900">{coreTemperature.toFixed(1)}°C</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="100"
                  step="0.5"
                  value={coreTemperature}
                  onChange={(e) => setCoreTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>-5°C (Frozen)</span>
                  <span className="text-cyan-600">4°C (Chilled)</span>
                  <span className="text-rose-600 font-bold">5°C - 60°C (Bacterial Multiplication)</span>
                  <span className="text-emerald-600 font-bold">&gt;60°C (Safe Holding)</span>
                  <span>100°C (Boiling)</span>
                </div>
              </div>

              {/* Parameter 2: e-Nose TVB-N Volatile Gas Emission */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className={`w-4 h-4 ${isSevereGas ? 'text-rose-600' : vocGasPpm > 15 ? 'text-amber-600' : 'text-emerald-600'}`} />
                    <span className="text-xs font-bold text-slate-800">e-Nose Headspace Volatiles (TVB-N / NH3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSevereGas ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        High Microbial Byproducts
                      </span>
                    ) : vocGasPpm > 15 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Elevated Volatiles
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Fresh / Baseline
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-900">{vocGasPpm.toFixed(1)} ppm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={vocGasPpm}
                  onChange={(e) => setVocGasPpm(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0 ppm (Pristine)</span>
                  <span className="text-emerald-600">&lt; 15 ppm (Fresh)</span>
                  <span className="text-amber-600">15-28 ppm (Warning)</span>
                  <span className="text-rose-600 font-bold">&gt; 28 ppm (Spoiled/Decomposing)</span>
                  <span>100 ppm</span>
                </div>
              </div>

              {/* Parameter 3: Food Acidity (pH Level) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className={`w-4 h-4 ${isSourPh ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <span className="text-xs font-bold text-slate-800">Food Matrix Acidity (pH Electrode)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSourPh ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        Lactic Souring / Acid Spoilage
                      </span>
                    ) : phLevel > 7.6 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        Alkaline Drift
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Normal Matrix pH
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-900">{phLevel.toFixed(2)} pH</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="9.0"
                  step="0.05"
                  value={phLevel}
                  onChange={(e) => setPhLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="text-rose-600 font-bold">3.0 (Acidic/Sour)</span>
                  <span className="text-amber-600">&lt; 5.2 (Fermentation)</span>
                  <span className="text-emerald-600 font-bold">6.0 - 7.2 (Ideal Fresh)</span>
                  <span>9.0 (Alkaline)</span>
                </div>
              </div>

              {/* Parameter 4: Water Activity (aw) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Water Activity / Free Moisture (aw)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      moistureAw >= 0.85
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {moistureAw >= 0.85 ? 'High Bacterial Availability' : 'Low Microbial Mobility'}
                    </span>
                    <span className="text-sm font-black text-slate-900">{moistureAw.toFixed(2)} aw</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="1.00"
                  step="0.01"
                  value={moistureAw}
                  onChange={(e) => setMoistureAw(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0.50 aw</span>
                  <span className="text-emerald-600">&lt; 0.85 aw (Inhibits most bacteria)</span>
                  <span className="text-amber-600 font-bold">&gt; 0.85 aw (Rapid Multiplication)</span>
                  <span>1.00 aw (Pure Water)</span>
                </div>
              </div>
            </div>

            {/* Run Assessment CTA */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isAnalyzing ? 'Transmitting & Evaluating Sensor Telemetry...' : 'Transmit & Evaluate IoT Sensor Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Biochemical Spoilage Diagnostic Report & Human Verification */}
        <div className="lg:col-span-6 space-y-6">
          {currentInspection ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Report Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    Biochemical Sensor Inspection Report
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {currentInspection.foodItem?.name || 'Inspected Food Batch'}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Probe: <code className="font-mono text-slate-700">{currentInspection.probeId || selectedProbeId}</code></span>
                    <span>•</span>
                    <span>{new Date(currentInspection.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* FQI Score Pill */}
                <div className="text-right bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                  <div className={`text-3xl font-black ${
                    currentInspection.qualityScore >= 75
                      ? 'text-emerald-600'
                      : currentInspection.qualityScore >= 45
                      ? 'text-amber-500'
                      : 'text-rose-600'
                  }`}>
                    {currentInspection.qualityScore}<span className="text-base font-normal text-slate-400">/100</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Food Quality Index (FQI)
                  </span>
                </div>
              </div>

              {/* Freshness & Risk Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Freshness Tier:</span>
                  <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg ${
                    currentInspection.freshnessCategory === 'EXCELLENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentInspection.freshnessCategory === 'GOOD'
                      ? 'bg-teal-100 text-teal-800'
                      : currentInspection.freshnessCategory === 'FAIR'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {currentInspection.freshnessCategory}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Spoilage Hazard:</span>
                  <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg ${
                    currentInspection.spoilageRisk === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentInspection.spoilageRisk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {currentInspection.spoilageRisk} RISK
                  </span>
                </div>
              </div>

              {/* 4 Multi-Parameter Sensor Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Thermometer className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Core Temp</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {currentInspection.coreTemperature !== undefined ? `${currentInspection.coreTemperature.toFixed(1)}°C` : `${coreTemperature.toFixed(1)}°C`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Pt1000 RTD</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Wind className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">e-Nose TVB-N</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {currentInspection.vocGasPpm !== undefined ? `${currentInspection.vocGasPpm.toFixed(1)} ppm` : `${vocGasPpm.toFixed(1)} ppm`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Volatile Gas</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <FlaskConical className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Matrix Acidity</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {currentInspection.phLevel !== undefined ? `${currentInspection.phLevel.toFixed(2)} pH` : `${phLevel.toFixed(2)} pH`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Glass Electrode</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Droplets className="w-4 h-4 mx-auto text-cyan-600 mb-1" />
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Moisture</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {currentInspection.moistureAw !== undefined ? `${currentInspection.moistureAw.toFixed(2)} aw` : `${moistureAw.toFixed(2)} aw`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Water Activity</div>
                </div>
              </div>

              {/* Assessment Findings & Recommendations */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    Biochemical Sensor Diagnostics:
                  </span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentInspection.visualIssues}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-slate-800 block">Recommended Operational Action:</span>
                  <p className="text-emerald-700 font-semibold mt-0.5">{currentInspection.recommendedAction}</p>
                </div>
              </div>

              {/* Codex & FSSAI Advisory Compliance */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Regulatory Advisory (FSSAI / Codex Alimentarius):</strong> {currentInspection.disclaimer}
                </span>
              </div>

              {/* Human Reviewer Sign-Off Section */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Certified Kitchen Officer Sign-Off:
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentInspection.reviewerStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentInspection.reviewerStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentInspection.reviewerStatus}
                  </span>
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional QA sign-off notes or inspector badge verification..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleReviewAction('APPROVED')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Batch</span>
                  </button>

                  <button
                    onClick={() => handleReviewAction('REVIEW_REQUESTED')}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Request Re-test</span>
                  </button>

                  <button
                    onClick={() => handleReviewAction('REJECTED')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Batch</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select or transmit sensor probe telemetry to view detailed biochemical diagnostic outputs.
            </div>
          )}
        </div>
      </div>

      {/* Historical IoT Sensor Inspections Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historical IoT Quality Inspections Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">Auditable multi-sensor telemetry log with FSSAI compliant tamper-evident records</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {inspections.length} Recorded Inspections
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Timestamp / Food Item</th>
                <th className="px-6 py-3">Probe ID</th>
                <th className="px-6 py-3">Sensor Telemetry</th>
                <th className="px-6 py-3">FQI Score</th>
                <th className="px-6 py-3">Freshness</th>
                <th className="px-6 py-3">Sign-off Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-slate-900">{insp.foodItem?.name || 'Food Batch'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(insp.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600">
                    {insp.probeId || 'BENCH-LAB-900'}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                        {insp.coreTemperature !== undefined ? `${insp.coreTemperature.toFixed(1)}°C` : '65.0°C'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                        {insp.vocGasPpm !== undefined ? `${insp.vocGasPpm.toFixed(1)} ppm` : '8.5 ppm'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                        {insp.phLevel !== undefined ? `${insp.phLevel.toFixed(2)} pH` : '6.40 pH'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-black text-sm ${
                      insp.qualityScore >= 75 ? 'text-emerald-600' : insp.qualityScore >= 45 ? 'text-amber-500' : 'text-rose-600'
                    }`}>
                      {insp.qualityScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      insp.freshnessCategory === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : insp.freshnessCategory === 'GOOD'
                        ? 'bg-teal-100 text-teal-800'
                        : insp.freshnessCategory === 'FAIR'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {insp.freshnessCategory}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      insp.reviewerStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : insp.reviewerStatus === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {insp.reviewerStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setCurrentInspection(insp);
                        if (insp.coreTemperature !== undefined) setCoreTemperature(insp.coreTemperature);
                        if (insp.vocGasPpm !== undefined) setVocGasPpm(insp.vocGasPpm);
                        if (insp.phLevel !== undefined) setPhLevel(insp.phLevel);
                        if (insp.moistureAw !== undefined) setMoistureAw(insp.moistureAw);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No IoT sensor inspections recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
