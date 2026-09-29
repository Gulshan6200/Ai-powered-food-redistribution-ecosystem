import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Users,
  Utensils,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Donation } from '../../types';

interface NgoDashboardProps {
  onNavigate: (path: string) => void;
}

export const NgoDashboardPage: React.FC<NgoDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'OFFERS' | 'SCHEDULED' | 'HISTORY'>('OFFERS');

  const loadNgoData = async () => {
    setIsLoading(true);
    try {
      const [donRes, dashRes] = await Promise.all([
        api.get('/donations'),
        api.get('/ngos/dashboard-summary')
      ]);

      if (donRes.success && donRes.donations) {
        setDonations(donRes.donations);
      }
      if (dashRes.success && dashRes.data) {
        setMetrics(dashRes.data.metrics);
      }
    } catch (err: any) {
      showToast('Failed to load NGO dashboard', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNgoData();
  }, []);

  const handleUpdateStatus = async (donationId: string, status: string) => {
    try {
      const res = await api.put(`/donations/${donationId}/status`, { status });
      if (res.success) {
        if (status === 'ACCEPTED') {
          showToast('Donation accepted! Pickup request generated in Logistics.', 'success', 'Offer Accepted');
        } else if (status === 'RECEIVED') {
          showToast('Delivery receipt confirmed! Impact counters updated.', 'success', 'Meals Received');
        } else {
          showToast(`Donation status updated to ${status}`, 'info', 'Status Updated');
        }
        loadNgoData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error', 'Error');
    }
  };

  const incomingOffers = donations.filter(d => d.status === 'OFFERED');
  const scheduledDonations = donations.filter(d => ['ACCEPTED', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(d.status));
  const completedDonations = donations.filter(d => d.status === 'RECEIVED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            <span>NGO & Food Bank Community Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accept fresh kitchen donations, track incoming electric fleet deliveries, and confirm beneficiary meals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadNgoData}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('/logistics')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-semibold flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Delivery Fleet</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Incoming Surplus Offers</span>
          <div className="text-3xl font-black text-amber-600">{incomingOffers.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting NGO acceptance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Pickups / In-Transit</span>
          <div className="text-3xl font-black text-blue-600">{scheduledDonations.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Assigned to delivery fleet</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Food Received</span>
          <div className="text-3xl font-black text-emerald-600">
            {metrics?.totalFoodRescuedKg ? `${metrics.totalFoodRescuedKg} kg` : '64 kg'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Rescued institutional batches</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Meals Provided</span>
          <div className="text-3xl font-black text-indigo-600">
            {metrics?.totalMealsReceived || 160}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Served to community beneficiaries</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('OFFERS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'OFFERS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Incoming Offers ({incomingOffers.length})
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'SCHEDULED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Scheduled & In-Transit ({scheduledDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Received History ({completedDonations.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'OFFERS' && (
        <div className="space-y-4">
          {incomingOffers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No new incoming offers right now. Active surplus listed by kitchens will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingOffers.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {donation.surplusListing?.dietaryCategory}
                        </span>
                        <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                          {donation.surplusListing?.foodItem?.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Offered to: <span className="text-slate-900 font-bold">{donation.ngo?.name}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-600">
                          {donation.quantity} {donation.unit}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          ~{Math.round(donation.quantity * 2.5)} Meals
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 my-3">
                      <div className="text-[11px] text-slate-600">
                        <strong>Match Reasoning:</strong> {donation.matchReasoning}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Platform Match Score: <span className="font-bold text-emerald-700">{donation.matchScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateStatus(donation.id, 'ACCEPTED')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Donation</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(donation.id, 'REJECTED')}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'SCHEDULED' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledDonations.map((donation) => (
              <div
                key={donation.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      STATUS: {donation.status}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {donation.quantity} {donation.unit}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">
                    {donation.surplusListing?.foodItem?.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Destination: {donation.ngo?.name}
                  </p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fleet Assigned: Tata Ace EV (Electric Cold-Chain)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated Arrival: ~20 mins</span>
                    </div>
                  </div>
                </div>

                {/* Receipt confirmation button */}
                {['DELIVERED', 'IN_TRANSIT', 'ACCEPTED'].includes(donation.status) && (
                  <button
                    onClick={() => handleUpdateStatus(donation.id, 'RECEIVED')}
                    className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Receipt ({donation.quantity} kg)</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Food Item</th>
                <th className="py-3.5 px-4">NGO Beneficiary</th>
                <th className="py-3.5 px-4">Quantity Rescued</th>
                <th className="py-3.5 px-4">Meals Served</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {completedDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{d.surplusListing?.foodItem?.name}</td>
                  <td className="py-3.5 px-4">{d.ngo?.name}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{d.quantity} {d.unit}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{Math.round(d.quantity * 2.5)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      RECEIVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
