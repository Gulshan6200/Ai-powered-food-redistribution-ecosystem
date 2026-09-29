import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Server-Sent Events (SSE) listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'CONNECTED') return;

          if (parsed.type === 'SENSOR_TELEMETRY_UPDATED' && parsed.data.alerts?.length > 0) {
            showToast(
              `Critical: ${parsed.data.alerts[0].title}`,
              'warning',
              'Storage Alert'
            );
          } else if (parsed.type === 'SURPLUS_CREATED') {
            showToast(
              `New surplus listing posted for redistribution: ${parsed.data.listing.quantity} kg`,
              'info',
              'Redistribution Hub'
            );
          } else if (parsed.type === 'DONATION_OFFERED') {
            showToast(
              `New donation match offered to NGO: ${parsed.data.donation.quantity} kg`,
              'success',
              'Surplus Matched'
            );
          } else if (parsed.type === 'ROUTE_OPTIMIZED') {
            showToast(
              `Logistics dispatch route optimized (${parsed.data.plan.totalDistanceKm} km)`,
              'success',
              'Fleet Dispatched'
            );
          } else if (parsed.type === 'PICKUP_STATUS_CHANGED') {
            showToast(
              `Delivery status updated to: ${parsed.data.status}`,
              'info',
              'Logistics Tracker'
            );
          }
        } catch (err) {
          // ignore parsing error
        }
      };

      eventSource.onerror = () => {
        // Stream reconnect handled by browser EventSource
      };
    } catch (e) {
      console.warn('SSE connection error:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-emerald-50 border-emerald-500 text-emerald-950',
            error: 'bg-rose-50 border-rose-500 text-rose-950',
            warning: 'bg-amber-50 border-amber-500 text-amber-950',
            info: 'bg-sky-50 border-sky-500 text-sky-950',
          };

          const icons = {
            success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg transition-all duration-300 transform translate-y-0 ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-sm">
                {toast.title && <p className="font-semibold">{toast.title}</p>}
                <p className="text-slate-700">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
