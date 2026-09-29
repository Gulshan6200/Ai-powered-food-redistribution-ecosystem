import React, { useState } from 'react';
import { Leaf, Lock, Mail, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState<string>('kitchen@foodcycle.ai');
  const [password, setPassword] = useState<string>('Password123!');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const quickRoles = [
    { name: 'Kitchen Manager', email: 'kitchen@foodcycle.ai', role: 'KITCHEN_MANAGER', target: '/dashboard' },
    { name: 'NGO Coordinator', email: 'ngo@foodcycle.ai', role: 'NGO_COORDINATOR', target: '/ngo' },
    { name: 'Logistics Operator', email: 'logistics@foodcycle.ai', role: 'LOGISTICS_OPERATOR', target: '/logistics' },
    { name: 'Processing Manager', email: 'processing@foodcycle.ai', role: 'PROCESSING_MANAGER', target: '/processing' },
    { name: 'System Admin', email: 'admin@foodcycle.ai', role: 'ADMIN', target: '/admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.fullName}!`, 'success', 'Signed In');

      // Redirect based on role
      if (user.role === 'NGO_COORDINATOR') {
        onNavigate('/ngo');
      } else if (user.role === 'LOGISTICS_OPERATOR') {
        onNavigate('/logistics');
      } else if (user.role === 'PROCESSING_MANAGER') {
        onNavigate('/processing');
      } else if (user.role === 'ADMIN') {
        onNavigate('/admin');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
      showToast(err.message || 'Login failed', 'error', 'Authentication Error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuickRole = (acc: typeof quickRoles[0]) => {
    setEmail(acc.email);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/25 mb-4">
            <Leaf className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">SmartFood AI</h2>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mt-1">Predict • Prevent • Redistribute</p>
          <p className="text-xs text-slate-500 mt-2">Institutional Kitchens & Food Processing Sustainable Ecosystem</p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sign In to Your Workspace</h3>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@foodcycle.ai"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>

              <span className="text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Accounts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickRoles.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectQuickRole(acc)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    email === acc.email
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{acc.email.split('@')[0]}</div>
                  </div>
                  {email === acc.email && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Encrypted with bcrypt & JWT session tokens. Role-based access control enabled.
        </p>
      </div>
    </div>
  );
};
