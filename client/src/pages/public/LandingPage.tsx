import React from 'react';
import {
  Leaf,
  TrendingUp,
  Boxes,
  Activity,
  Share2,
  Truck,
  FileText,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Heart,
  Globe2,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const pillars = [
    {
      title: 'AI Food Intelligence',
      tagline: 'Demand & Surplus Prediction',
      desc: 'Hierarchical time-series demand forecasting with day-of-week seasonality, confidence intervals, and stockout-averse production recommendations.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Smart IoT Monitoring',
      tagline: 'Multi-Sensor Biochemical Quality',
      desc: 'Real-time telemetry tracking of core temperature, volatile organic emissions (TVB-N e-Nose), and food matrix pH level acidity.',
      icon: Activity,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Redistribution Network',
      tagline: 'Multi-Factor NGO & Fleet Matching',
      desc: 'Proximity, dietary preference, and beneficiary capacity-constrained matching algorithm connecting surplus kitchen batches with local shelters.',
      icon: Share2,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Impact & ESG Reporting',
      tagline: 'Auditable Sustainability Metrics',
      desc: 'Transparent conversion calculators estimating food rescued, meals distributed, carbon avoidance, water conservation, and downloadable ESG reports.',
      icon: FileText,
      color: 'from-emerald-600 to-green-700',
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'Preparation & Monitoring', desc: 'Kitchen records daily production while IoT sensors continuously monitor walk-in freezers and hot-holding units.' },
    { step: '02', title: 'AI Forecast & Surplus Detection', desc: 'Predictive models evaluate consumption patterns to forecast expected surplus portions 24 to 72 hours in advance.' },
    { step: '03', title: 'IoT Quality Verification', desc: 'Multi-parameter probes evaluate core temperature, TVB-N gas emissions, and pH acidity; certified personnel perform digital safety sign-off.' },
    { step: '04', title: 'Automated NGO Dispatch', desc: 'Matching algorithm identifies nearby food banks with open capacity; electric fleet drivers optimize redistribution routes.' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Public Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                SmartFood <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">MoFPI Problem Statement SIH26234</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Live Demo
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Access Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            Ministry of Food Processing Industries (MoFPI)
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Predict. Prevent. <span className="text-emerald-600">Redistribute.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            AI-powered integrated food intelligence, smart cold storage telemetry, and rapid surplus redistribution ecosystem engineered for institutional kitchens, processing units, and humanitarian food relief networks.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 text-base transition-all hover:scale-[1.02]"
            >
              <span>Launch Operational Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('/forecast')}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-base transition-colors"
            >
              <span>Explore AI Forecasting Pipeline</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200/80">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">58.7%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Food Waste Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-emerald-600">14,200+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Meals Rescued & Redistributed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">&lt; 2.5 hrs</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Surplus-to-Shelter Transit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-teal-600">100%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Downstream Data Traceability</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">System Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Four Pillars of SmartFood AI
            </h3>
            <p className="mt-4 text-slate-600 text-sm sm:text-base">
              A synchronized software ecosystem designed to prevent food waste before it happens, verify food safety with real-time IoT multi-probe sensor diagnostics, and coordinate zero-emission logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center shadow-md mb-6`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {pillar.tagline}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">{pillar.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
                    <span>Explore Module</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Interactive Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              End-to-End Operational Lifecycle
            </h3>
            <p className="mt-4 text-slate-600 text-sm">
              Every action taken on SmartFood AI cascades downstream into actual database state updates, inventory adjustments, and verifiable ESG metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                <span className="text-3xl font-black text-slate-200 block mb-3">{ws.step}</span>
                <h4 className="font-bold text-slate-900 text-base mb-2">{ws.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ws.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">Ready to see SmartFood AI in action?</h3>
          <p className="mt-3 text-slate-400 text-sm max-w-2xl mx-auto">
            Log in with pre-configured institutional roles to explore demand forecasting, smart storage monitoring, computer vision quality assessment, and logistics route optimization.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onNavigate('/login')}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm shadow-lg transition-transform hover:scale-[1.02]"
            >
              Sign In to SmartFood AI
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-colors"
            >
              Open Kitchen Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
