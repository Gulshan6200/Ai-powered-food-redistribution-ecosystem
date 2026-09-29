import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { RedistributionMap } from '../../components/maps/RedistributionMap';
import { Pickup } from '../../types';

export const LogisticsPage: React.FC = () => {
  const { showToast } = useNotification();

  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const loadLogistics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/logistics/overview');
      if (res.success) {
        setPickups(res.pickups || []);
        setVehicles(res.vehicles || []);
        setDrivers(res.drivers || []);
        if (res.activeRoutes?.length > 0) {
          setActiveRoute(res.activeRoutes[0]);
        }
      }
    } catch (err: any) {
      showToast('Failed to load logistics overview', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogistics();
  }, []);

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const res = await api.post('/logistics/optimize', {});
      if (res.success && res.plan) {
        setActiveRoute(res.route);
        showToast(
          `Route optimized! Total Distance: ${res.plan.totalDistanceKm} km, Travel: ${res.plan.totalTimeMinutes} mins`,
          'success',
          'Route Optimization'
        );
        loadLogistics();
      }
    } catch (err: any) {
      showToast(err.message || 'Route optimization failed', 'error', 'Error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdatePickupStatus = async (pickupId: string, status: string) => {
    try {
      const res = await api.put(`/logistics/pickups/${pickupId}/status`, {
        status,
        recipientSignature: `SIG-DIGITAL-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: 'Delivered in temperature-controlled electric vehicle insulated bin.'
      });

      if (res.success) {
        showToast(`Pickup marked as ${status}`, 'success', 'Status Updated');
        loadLogistics();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error', 'Error');
    }
  };

  // Extract map waypoints and stops from active route or pickups
  const mapStops: Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'PICKUP' | 'DROPOFF';
    quantityKg: number;
  }> = pickups.map(p => ({
    name: p.destinationAddress,
    address: p.destinationAddress,
    lat: p.destLat,
    lng: p.destLng,
    type: 'DROPOFF' as const,
    quantityKg: p.donation?.quantity || 30
  }));

  if (pickups.length > 0) {
    mapStops.unshift({
      name: pickups[0].pickupAddress,
      address: pickups[0].pickupAddress,
      lat: pickups[0].pickupLat,
      lng: pickups[0].pickupLng,
      type: 'PICKUP' as const,
      quantityKg: pickups[0].donation?.quantity || 30
    });
  }

  let waypoints: Array<[number, number]> = [];
  if (activeRoute?.optimizedWaypoints) {
    try {
      waypoints = JSON.parse(activeRoute.optimizedWaypoints);
    } catch (e) {
      // fallback
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>Green Logistics & Route Optimization</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capacity-aware, deadline-constrained multi-stop redistribution fleet dispatching
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogistics}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isOptimizing ? 'Optimizing Waypoints...' : 'Optimize Multi-Stop Route'}</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Electric Fleet</span>
          <div className="text-2xl font-black text-slate-900">{vehicles.length} Vehicles</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Tata Ace EV (Refrigerated)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Assigned Pickups</span>
          <div className="text-2xl font-black text-blue-600">{pickups.length} Pickups</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled for transit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fleet Capacity Utilization</span>
          <div className="text-2xl font-black text-emerald-600">{activeRoute?.capacityUsagePct || 68.5}%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Balanced volume loads</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Travel Time</span>
          <div className="text-2xl font-black text-slate-900">{activeRoute?.totalTimeMinutes || 38} mins</div>
          <span className="text-[10px] text-slate-400 mt-1 block">{activeRoute?.totalDistanceKm || 6.2} km route</span>
        </div>
      </div>

      {/* Leaflet OpenStreetMap Route Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Delivery Route Map (OpenStreetMap)</h3>
            <p className="text-xs text-slate-500">Waypoint navigation connecting kitchen batch pickup to community shelters</p>
          </div>
          {activeRoute && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase">
              Route Code: {activeRoute.routeCode}
            </span>
          )}
        </div>

        <RedistributionMap
          centerLat={12.8399}
          centerLng={77.6770}
          zoom={13}
          waypoints={waypoints}
          stops={mapStops}
        />
      </div>

      {/* Pickup Queue Table with State Transition Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Redistribution Pickup & Delivery Queue</h3>
          <p className="text-xs text-slate-500">Real-time driver assignment, status transitions, and delivery confirmation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Batch & Quantity</th>
                <th className="py-3.5 px-4">Pickup Location</th>
                <th className="py-3.5 px-4">Destination NGO</th>
                <th className="py-3.5 px-4">Est. Distance & Transit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading pickups...</td>
                </tr>
              ) : pickups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No pickups currently queued. Accept donation offers in NGO Hub to populate queue.</td>
                </tr>
              ) : (
                pickups.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {p.donation?.surplusListing?.foodItem?.name || 'Cooked Batch'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-extrabold mt-0.5">
                        {p.donation?.quantity} kg (~{Math.round((p.donation?.quantity || 20) * 2.5)} meals)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.pickupAddress.split(',')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.pickupAddress}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.destinationAddress.split(',')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.destinationAddress}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.estimatedDistance} km</div>
                      <div className="text-[10px] text-slate-400">~{p.estimatedMinutes} mins transit</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : p.status === 'PICKED_UP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'PENDING' || p.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleUpdatePickupStatus(p.id, 'PICKED_UP')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Mark Picked Up
                        </button>
                      ) : p.status === 'PICKED_UP' ? (
                        <button
                          onClick={() => handleUpdatePickupStatus(p.id, 'IN_TRANSIT')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Mark In Transit
                        </button>
                      ) : p.status === 'IN_TRANSIT' ? (
                        <button
                          onClick={() => handleUpdatePickupStatus(p.id, 'DELIVERED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Confirm Delivered
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
