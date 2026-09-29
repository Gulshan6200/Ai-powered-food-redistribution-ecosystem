import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  Thermometer,
  Droplets,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { InventoryItem, FoodItem } from '../../types';

export const InventoryPage: React.FC = () => {
  const { showToast } = useNotification();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    foodItemId: '',
    batchNumber: '',
    quantity: 30,
    unit: 'kg',
    storageLocation: 'Hot Holding 01',
    temperature: 65.0,
    humidity: 45,
    supplier: 'Central Institutional Kitchen Prep',
    expiryHours: 6
  });

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/inventory', {
        search,
        status: statusFilter,
        riskLevel: riskFilter,
        page,
        limit: 8
      });

      if (res.success) {
        setItems(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load inventory', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFoodItems = async () => {
    try {
      const res = await api.get('/forecast/items');
      if (res.success && res.items) {
        setFoodItems(res.items);
        if (res.items.length > 0 && !formData.foodItemId) {
          setFormData(prev => ({ ...prev, foodItemId: res.items[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [search, statusFilter, riskFilter, page]);

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + Number(formData.expiryHours));

      const res = await api.post('/inventory', {
        foodItemId: formData.foodItemId,
        batchNumber: formData.batchNumber || `BAT-${Date.now().toString().slice(-5)}`,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        storageLocation: formData.storageLocation,
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        supplier: formData.supplier,
        expiryDate: expiryDate.toISOString()
      });

      if (res.success) {
        showToast(`Inventory batch ${res.item.batchNumber} added successfully`, 'success', 'Item Added');
        setShowAddModal(false);
        loadInventory();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create inventory item', 'error', 'Error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory record?')) return;

    try {
      const res = await api.delete(`/inventory/${id}`);
      if (res.success) {
        showToast('Inventory batch deleted', 'info', 'Record Removed');
        loadInventory();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete inventory', 'error', 'Error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SAFE':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">SAFE</span>;
      case 'MONITOR':
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-200">MONITOR</span>;
      case 'NEAR_EXPIRY':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">NEAR EXPIRY</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 animate-pulse">CRITICAL</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-300">EXPIRED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>Inventory & Batch Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track prepared batches, cold storage dwell times, and automatic expiry status indicators
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search batch or food item..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none font-medium text-slate-700"
          >
            <option value="">All Expiry Statuses</option>
            <option value="SAFE">Safe</option>
            <option value="MONITOR">Monitor</option>
            <option value="NEAR_EXPIRY">Near Expiry</option>
            <option value="CRITICAL">Critical</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none font-medium text-slate-700"
          >
            <option value="">All Spoilage Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <button
            onClick={loadInventory}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Item & Batch</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Storage Location</th>
                <th className="py-3.5 px-4">Telemetry</th>
                <th className="py-3.5 px-4">Expiry Window</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading inventory batches...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const expiryDate = new Date(item.expiryDate);
                  const hoursRemaining = Math.round(((expiryDate.getTime() - Date.now()) / (3600 * 1000)) * 10) / 10;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.foodItem.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.batchNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.storageLocation}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                          {item.temperature !== null && (
                            <span className="flex items-center gap-1 font-mono">
                              <Thermometer className="w-3 h-3 text-slate-400" />
                              {item.temperature}°C
                            </span>
                          )}
                          {item.humidity !== null && (
                            <span className="flex items-center gap-1 font-mono">
                              <Droplets className="w-3 h-3 text-slate-400" />
                              {item.humidity}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{expiryDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-400">
                          {hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'Expired'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {items.length} of {totalItems} batches</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-800">Page {page} of {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">Add Inventory Batch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Item</label>
                <select
                  value={formData.foodItemId}
                  onChange={(e) => setFormData({ ...formData, foodItemId: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                >
                  {foodItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. VB-2026-99"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Location</label>
                  <select
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Hot Holding 01">Hot Holding 01</option>
                    <option value="Hot Holding 02">Hot Holding 02</option>
                    <option value="Cold Storage 01">Cold Storage 01 (Walk-in)</option>
                    <option value="Cold Storage 02">Cold Storage 02 (Dairy)</option>
                    <option value="Dry Storage 01">Dry Storage 01</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Holding Shelf Life (Hours)</label>
                  <input
                    type="number"
                    value={formData.expiryHours}
                    onChange={(e) => setFormData({ ...formData, expiryHours: Number(e.target.value) })}
                    required
                    min={1}
                    max={72}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    value={formData.humidity}
                    onChange={(e) => setFormData({ ...formData, humidity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
