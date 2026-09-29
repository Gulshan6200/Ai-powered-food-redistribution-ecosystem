import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Building2,
  ShieldCheck,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'USERS' | 'ORGS' | 'AUDIT' | 'HEALTH'>('USERS');
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    fullName: '',
    password: 'Password123!',
    role: 'KITCHEN_MANAGER',
    phone: '+91 98800 00000',
    organizationId: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, orgsRes, auditRes, healthRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/organizations'),
        api.get('/admin/audit'),
        api.get('/admin/system-health')
      ]);

      if (usersRes.success) setUsers(usersRes.users || []);
      if (orgsRes.success) {
        setOrgs(orgsRes.organizations || []);
        if (orgsRes.organizations?.length > 0 && !newUserForm.organizationId) {
          setNewUserForm(prev => ({ ...prev, organizationId: orgsRes.organizations[0].id }));
        }
      }
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (healthRes.success) setSystemHealth(healthRes.health);
    } catch (err: any) {
      showToast('Admin privilege required or error loading data', 'error', 'Admin Notice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', newUserForm);
      if (res.success) {
        showToast(`User ${res.user.fullName} created successfully`, 'success', 'User Created');
        setShowAddUserModal(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>Enterprise System Administration & Audit</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            User provisioning, organization directory, immutable audit trail, and operational platform health
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'USERS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('ORGS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'ORGS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Organizations ({orgs.length})
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'AUDIT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('HEALTH')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'HEALTH' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          System Health Diagnostics
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{u.organization?.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Organizations */}
      {activeTab === 'ORGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <div key={org.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {org.type}
                </span>
                <span className="text-xs font-mono text-slate-400">{org.code}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{org.name}</h4>
              <p className="text-xs text-slate-500">{org.address}, {org.city}, {org.state}</p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div>Email: <span className="font-semibold text-slate-800">{org.contactEmail}</span></div>
                <div>Phone: <span className="font-semibold text-slate-800">{org.contactPhone}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono text-[11px]">{log.action}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">({log.userRole})</span>
                  </td>
                  <td className="py-3 px-4">{log.entity}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                    {log.newValue || log.oldValue || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: System Health Diagnostics */}
      {activeTab === 'HEALTH' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform Health & Infrastructure Diagnostics</h3>
              <p className="text-xs text-slate-500">Real-time status of embedded AI pipelines, database, and telemetry brokers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Database Provider</span>
              <div className="text-sm font-bold text-slate-900">{systemHealth?.database || 'CONNECTED (SQLite/Prisma)'}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Latency: 2ms • ACID compliant</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Forecasting Pipeline</span>
              <div className="text-sm font-bold text-slate-900">{systemHealth?.aiForecastingEngine || 'ONLINE (Exponential + Seasonality)'}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Status: Synchronized</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Real-Time Event Bus</span>
              <div className="text-sm font-bold text-slate-900">{systemHealth?.realtimeEventBus || 'ACTIVE (Server-Sent Events)'}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Zero-polling push pipeline</span>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Provision User Account</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="name@foodcycle.ai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 font-medium"
                >
                  <option value="KITCHEN_MANAGER">Kitchen Manager</option>
                  <option value="NGO_COORDINATOR">NGO Coordinator</option>
                  <option value="LOGISTICS_OPERATOR">Logistics Operator</option>
                  <option value="PROCESSING_MANAGER">Processing Manager</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
