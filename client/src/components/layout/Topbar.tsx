import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  Building2,
  LogOut,
  ChevronDown,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const { user, logout, login } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // Fast demo role switcher for seamless presentation
  const demoAccounts = [
    { role: 'Kitchen Manager', email: 'kitchen@foodcycle.ai', path: '/dashboard' },
    { role: 'Admin', email: 'admin@foodcycle.ai', path: '/admin' },
    { role: 'NGO Coordinator', email: 'ngo@foodcycle.ai', path: '/ngo' },
    { role: 'Logistics Operator', email: 'logistics@foodcycle.ai', path: '/logistics' },
    { role: 'Processing Manager', email: 'processing@foodcycle.ai', path: '/processing' }
  ];

  const handleSwitchAccount = async (email: string, path: string) => {
    setShowRoleMenu(false);
    try {
      await login(email, 'Password123!');
      onNavigate(path);
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches, NGOs, surplus, telemetry..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100/70 hover:bg-slate-100 focus:bg-white rounded-lg border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Date, Organization, Fast Role Switcher, Profile */}
      <div className="flex items-center gap-3">
        {/* Current Indian Date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Organization Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-200/60 font-medium">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate max-w-[150px]">{user?.organizationName || 'Apex Institutional Kitchen'}</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => onNavigate('/alerts')}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Alert Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </button>

        {/* Fast Switch Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
            title="Switch User Role"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-emerald-700 font-bold">{user?.role?.replace('_', ' ') || 'Guest'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Seeded Role
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSwitchAccount(acc.email, acc.path)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-800 transition-colors ${
                    user?.email === acc.email ? 'bg-emerald-50/70 text-emerald-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{acc.role}</span>
                  <span className="text-[10px] text-slate-400">{acc.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};
