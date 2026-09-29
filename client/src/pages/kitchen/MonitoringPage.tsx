import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Sensor } from '../../types';

export const MonitoringPage: React.FC = () => {
  const { showToast } = useNotification();

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const loadSensors = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sensors');
      if (res.success && res.sensors) {
        setSensors(res.sensors);
        if (res.sensors.length > 0 && !selectedSensorId) {
          setSelectedSensorId(res.sensors[0].id);
        }
      }
    } catch (err: any) {
      showToast('Failed to load sensors', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  const handleSimulate = async (forceAnomaly: boolean = false) => {
    setIsSimulating(true);
    try {
      const res = await api.post('/sensors/simulate', {
        sensorId: selectedSensorId,
        forceAnomaly
      });

      if (res.success) {
        if (forceAnomaly) {
          showToast(
            `Temperature excursion simulated! High alert generated.`,
            'warning',
            'Telemetry Excursion'
          );
        } else {
          showToast(
            `Telemetry readings refreshed via SensorSimulator adapter`,
            'success',
            'IoT Stream Updated'
          );
        }
        loadSensors();
      }
    } catch (err: any) {
      showToast('Failed to simulate sensor telemetry', 'error', 'Error');
    } finally {
      setIsSimulating(false);
    }
  };

  const currentSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];
  const telemetryHistory = (currentSensor?.readings || []).slice(-24).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    isAnomaly: r.isAnomaly
  }));

  const latestReading = currentSensor?.readings?.[0];
  const isExcursion = latestReading && latestReading.temperature > (currentSensor?.maxThreshold || 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>Smart Storage & IoT Monitoring</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cold storage, dry silos, and hot-holding temperature & humidity telemetry with real-time excursion detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulate(false)}
            disabled={isSimulating}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate IoT Telemetry</span>
          </button>

          <button
            onClick={() => handleSimulate(true)}
            disabled={isSimulating}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 text-xs font-semibold flex items-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Excursion (Anomaly)</span>
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map((sensor) => {
          const latest = sensor.readings?.[0];
          const hasExcursion = latest && latest.temperature > sensor.maxThreshold;
          const isSelected = sensor.id === selectedSensorId;

          return (
            <div
              key={sensor.id}
              onClick={() => setSelectedSensorId(sensor.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-500 shadow-md bg-white ring-2 ring-emerald-500/20'
                  : 'border-slate-200 shadow-sm bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  hasExcursion ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 truncate">{sensor.name}</span>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>ONLINE</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold tracking-tight ${hasExcursion ? 'text-rose-600' : 'text-slate-900'}`}>
                    {latest ? latest.temperature : '--'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">°C</span>
                </div>

                {latest?.humidity && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>{latest.humidity}%</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Safe: {sensor.minThreshold}°C – {sensor.maxThreshold}°C</span>
                {hasExcursion && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    High Excursion
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Excursion Warning Banner if current sensor is in anomaly state */}
      {isExcursion && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900">
              Temperature Threshold Exceeded: {currentSensor.name} ({latestReading.temperature}°C)
            </h4>
            <p className="text-rose-700 mt-0.5">
              Current temperature exceeds configured safety ceiling of {currentSensor.maxThreshold}°C. Storage condition compromised. Food batches in this zone must be inspected or expedited for immediate redistribution.
            </p>
          </div>
        </div>
      )}

      {/* Main Telemetry Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentSensor?.name} — 24-Hour Telemetry History
            </h3>
            <p className="text-xs text-slate-500">
              Adapter: <span className="font-mono text-emerald-700 font-semibold">{currentSensor?.adapterType || 'SensorSimulator'}</span> • Location: {currentSensor?.location}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Temperature (°C)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span>Humidity (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-4 h-0.5 border-t border-dashed border-rose-500" />
              <span>Max Threshold</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryHistory} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              {currentSensor && (
                <ReferenceLine y={currentSensor.maxThreshold} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Max Limit: ${currentSensor.maxThreshold}°C`, position: 'top', fill: '#ef4444', fontSize: 10 }} />
              )}
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* IoT Architecture Information Panel */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Pluggable Sensor Telemetry Architecture</span>
        </h4>
        <p className="text-slate-600 leading-relaxed">
          The SmartFood monitoring layer supports three interchangeable telemetry adapters: <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-emerald-700">SensorSimulator</code> (active for testing & compliance), <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">MQTTAdapter</code> (for direct broker streaming from ESP32/Zigbee nodes), and <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">RESTSensorAdapter</code> (for Modbus gateway webhooks). Simulated telemetry is clearly designated to maintain rigorous data integrity.
        </p>
      </div>
    </div>
  );
};
