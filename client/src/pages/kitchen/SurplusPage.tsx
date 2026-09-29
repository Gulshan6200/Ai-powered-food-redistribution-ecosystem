import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Share2,
  X,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { SurplusListing, SurplusPrediction, FoodItem } from '../../types';

interface SurplusPageProps {
  onNavigate: (path: string) => void;
}

export const SurplusPage: React.FC<SurplusPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();

  const [predictions, setPredictions] = useState<SurplusPrediction[]>([]);
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedPrediction, setSelectedPrediction] = useState<SurplusPrediction | null>(null);
  const [createForm, setCreateForm] = useState({
    foodItemId: '',
    quantity: 35,
    shelfLifeHours: 5,
    storageCondition: 'Hot Packaged insulated containers',
    dietaryCategory: 'VEG'
  });

  const loadSurplusData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/surplus');
      if (res.success) {
        setPredictions(res.predictions || []);
        setListings(res.listings || []);
        setFoodItems(res.foodItems || []);
        if (res.foodItems?.length > 0 && !createForm.foodItemId) {
          setCreateForm(prev => ({ ...prev, foodItemId: res.foodItems[0].id }));
        }
      }
    } catch (err: any) {
      showToast('Failed to load surplus data', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurplusData();
  }, []);

  const openCreateFromPrediction = (pred: SurplusPrediction) => {
    setSelectedPrediction(pred);
    setCreateForm({
      foodItemId: pred.foodItemId,
      quantity: Math.round(pred.predictedSurplus),
      shelfLifeHours: Math.max(2, Math.round(pred.remainingShelfHours)),
      storageCondition: 'Hot Packaged insulated containers',
      dietaryCategory: 'VEG'
    });
    setShowCreateModal(true);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/surplus', createForm);
      if (res.success) {
        showToast(
          `Surplus listing created for ${createForm.quantity} kg. Ready for NGO matching.`,
          'success',
          'Surplus Listed'
        );
        setShowCreateModal(false);
        loadSurplusData();
        onNavigate('/redistribution');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create surplus listing', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Surplus Prediction & Allocation Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic surplus predictions based on production volume, actual consumption, and remaining shelf life
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Redistribution Request</span>
        </button>
      </div>

      {/* Priority Engine Formula Explainer Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            ∑
          </div>
          <div>
            <h4 className="font-bold text-emerald-950">Multi-Factor Priority Calculation Engine</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Priority Score = (Surplus Quantity × 0.3) + (1 / Remaining Hours × 40) + Quality Risk Weight + NGO Demand Index
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/redistribution')}
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors flex-shrink-0"
        >
          <span>Redistribution Network</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Predicted Surplus Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Predicted Surplus Batches</h3>
            <p className="text-xs text-slate-500">Calculated continuously from shift production & actual consumption</p>
          </div>
          <button
            onClick={loadSurplusData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Food Item</th>
                <th className="py-3.5 px-4">Produced</th>
                <th className="py-3.5 px-4">Consumed</th>
                <th className="py-3.5 px-4">Predicted Surplus</th>
                <th className="py-3.5 px-4">Shelf Life Remaining</th>
                <th className="py-3.5 px-4">Quality Risk</th>
                <th className="py-3.5 px-4">Redistribution Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">Loading predictions...</td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">No surplus predictions currently active.</td>
                </tr>
              ) : (
                predictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {pred.foodItem?.name || 'Cooked Meal'}
                    </td>
                    <td className="py-3.5 px-4">{pred.producedQuantity} kg</td>
                    <td className="py-3.5 px-4">{pred.consumedQuantity} kg</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 text-sm">
                      {pred.predictedSurplus} kg
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {pred.remainingShelfHours} hours
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pred.qualityRisk === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : pred.qualityRisk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {pred.qualityRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                        pred.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {pred.priority} ({pred.priorityScore || 72})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {pred.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openCreateFromPrediction(pred)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        List for Redistribution
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Surplus Listings Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Active Redistribution Listings in Circulation</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {listing.dietaryCategory}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    listing.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {listing.status}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">{listing.foodItem?.name}</h4>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {listing.availableQuantity} <span className="text-sm font-semibold text-slate-500">/ {listing.quantity} {listing.unit}</span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pickup Deadline: {new Date(listing.pickupDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{listing.storageCondition}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('/redistribution')}
                className="w-full mt-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Match with Nearby NGOs</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Create Redistribution Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Item</label>
                <select
                  value={createForm.foodItemId}
                  onChange={(e) => setCreateForm({ ...createForm, foodItemId: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                >
                  {foodItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Surplus Quantity (kg)</label>
                <input
                  type="number"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: Number(e.target.value) })}
                  required
                  min={1}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Redistribution Window (Hours)</label>
                <input
                  type="number"
                  value={createForm.shelfLifeHours}
                  onChange={(e) => setCreateForm({ ...createForm, shelfLifeHours: Number(e.target.value) })}
                  required
                  min={1}
                  max={24}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Condition</label>
                <input
                  type="text"
                  value={createForm.storageCondition}
                  onChange={(e) => setCreateForm({ ...createForm, storageCondition: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20"
                >
                  Publish & Match NGOs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
