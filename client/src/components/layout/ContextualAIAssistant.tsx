import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowRight, X } from 'lucide-react';
import { AIRecommendation } from '../../types';
import { api } from '../../services/api';

interface AssistantProps {
  onNavigate: (path: string) => void;
}

export const ContextualAIAssistant: React.FC<AssistantProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasDismissed, setHasDismissed] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.success && res.data?.recommendations) {
          setRecommendations(res.data.recommendations);
        }
      } catch (err) {
        // quiet fallback
      }
    };

    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 30000);
    return () => clearInterval(interval);
  }, []);

  if (hasDismissed || recommendations.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full transition-all duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden backdrop-blur-md">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3.5 px-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 flex items-center justify-between cursor-pointer select-none border-b border-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
                SmartFood Intelligence
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h4>
              <p className="text-[10px] text-slate-400">
                {recommendations.length} Active System Recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasDismissed(true);
              }}
              className="p-1 hover:text-white rounded"
              title="Dismiss for this session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-3 max-h-[380px] overflow-y-auto space-y-3 bg-slate-950/60">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`font-semibold ${
                      rec.severity === 'CRITICAL'
                        ? 'text-rose-400'
                        : rec.severity === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {rec.title}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                    {rec.type}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{rec.message}</p>

                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">Reason: </span>
                    <span className="text-slate-300">{rec.reason}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Data Used: </span>
                    <span className="text-emerald-300 font-mono">{rec.dataUsed}</span>
                  </div>
                  <div className="pt-0.5 border-t border-slate-800">
                    <span className="text-slate-400 font-medium">Recommended Action: </span>
                    <span className="text-white font-medium">{rec.recommendedAction}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onNavigate(rec.targetRoute);
                    setIsExpanded(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors border border-emerald-500/30"
                >
                  <span>Apply Recommendation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
            <p className="text-[9px] text-slate-500 text-center italic pt-1">
              Contextual advice derived from live transactional and sensor data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
