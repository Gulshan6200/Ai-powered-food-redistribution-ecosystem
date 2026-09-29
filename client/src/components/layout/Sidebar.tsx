import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  Activity,
  Layers,
  Share2,
  Truck,
  Factory,
  HeartHandshake,
  Trash2,
  Leaf,
  FileText,
  Bell,
  Settings,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['KITCHEN_MANAGER', 'ADMIN', 'PROCESSING_MANAGER'] },
    { label: 'AI Demand Forecast', path: '/forecast', icon: TrendingUp, roles: ['KITCHEN_MANAGER', 'ADMIN'] },
    { label: 'Inventory', path: '/inventory', icon: Boxes, roles: ['KITCHEN_MANAGER', 'ADMIN'] },
    { label: 'Food Quality (IoT Sensors)', path: '/quality', icon: Activity, roles: ['KITCHEN_MANAGER', 'ADMIN'] },
    { label: 'Surplus Intelligence', path: '/surplus', icon: Layers, roles: ['KITCHEN_MANAGER', 'ADMIN'] },
    { label: 'Redistribution', path: '/redistribution', icon: Share2, roles: ['KITCHEN_MANAGER', 'ADMIN'] },
    { label: 'NGO Hub', path: '/ngo', icon: HeartHandshake, roles: ['NGO_COORDINATOR', 'ADMIN'] },
    { label: 'Logistics & Routes', path: '/logistics', icon: Truck, roles: ['LOGISTICS_OPERATOR', 'ADMIN'] },
    { label: 'Processing Efficiency', path: '/processing', icon: Factory, roles: ['PROCESSING_MANAGER', 'ADMIN'] },
    { label: 'Waste Analytics', path: '/analytics/waste', icon: Trash2, roles: ['KITCHEN_MANAGER', 'ADMIN', 'PROCESSING_MANAGER'] },
    { label: 'Sustainability', path: '/sustainability', icon: Leaf, roles: ['KITCHEN_MANAGER', 'ADMIN', 'PROCESSING_MANAGER'] },
    { label: 'ESG Reports', path: '/reports', icon: FileText, roles: ['KITCHEN_MANAGER', 'ADMIN', 'PROCESSING_MANAGER'] },
    { label: 'Alert Center', path: '/alerts', icon: Bell, roles: ['KITCHEN_MANAGER', 'ADMIN', 'PROCESSING_MANAGER', 'LOGISTICS_OPERATOR'] },
    { label: 'Admin Settings', path: '/admin', icon: Settings, roles: ['ADMIN'] },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                SmartFood <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Predict • Prevent • Redistribute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            const isAuthorized = !user || hasRole(item.roles as any);

            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${!isAuthorized ? 'opacity-60' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.label === 'Alert Center' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-900 font-semibold">SIH26234 MoFPI</span>
              <p className="text-[10px] text-slate-400">Sustainable Ecosystem</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
