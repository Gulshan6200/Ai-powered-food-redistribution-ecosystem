import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  FileSpreadsheet,
  Code,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const EsgReportsPage: React.FC = () => {
  const { showToast } = useNotification();

  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'>('Monthly');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/reports/generate', { period });
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (err: any) {
      showToast('Failed to generate ESG report', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [period]);

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    const token = localStorage.getItem('foodcycle_token');
    const url = `/api/reports/export/${format}?period=${period}`;

    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartFood_ESG_Report_${period}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloading ${format.toUpperCase()} report...`, 'success', 'Export Started');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>ESG & Sustainability Compliance Reporting</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated executive reporting, environmental footprint estimates, and multi-format compliance exports
          </p>
        </div>

        {/* Working Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Period Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Report Cycle:
          </span>
          {(['Daily', 'Weekly', 'Monthly', 'Quarterly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                period === p
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={generateReport}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          title="Regenerate"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Rendered Report Preview Document */}
      {report && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8 font-sans">
          {/* Report Top Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                ESG & Sustainability Audit
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {report.organizationName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reporting Period: <span className="font-bold text-slate-700">{report.reportPeriod}</span> • Generated on {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">DOC-ID: FC-ESG-2026-09</span>
              <div className="text-xs font-bold text-emerald-700 mt-1">Audit Status: Verified Internal Baseline</div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              1. Executive Sustainability Summary
            </h3>
            <p className="text-sm font-medium text-emerald-950 leading-relaxed">
              {report.executiveSummary.headline}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-emerald-800">
              <span>Waste Reduction: {report.executiveSummary.wasteReductionRate}</span>
              <span>•</span>
              <span>Financial Loss Avoided: ₹{report.executiveSummary.operationalCostSavingsInr.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 4 Pillars Summary Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Key Operational Performance Indicators
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Food Rescued</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{report.executiveSummary.foodRescuedKg} kg</div>
                <span className="text-[10px] text-slate-400">Batches safely diverted</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Meals Redistributed</span>
                <div className="text-2xl font-black text-blue-600 mt-1">{report.executiveSummary.mealsProvided}</div>
                <span className="text-[10px] text-slate-400">Nutritional portions</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Estimated CO₂ Avoided</span>
                <div className="text-2xl font-black text-teal-600 mt-1">{report.executiveSummary.carbonAvoidanceKg} kg</div>
                <span className="text-[10px] text-slate-400">Equivalent emissions offset</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Water Conserved</span>
                <div className="text-2xl font-black text-cyan-600 mt-1">{report.executiveSummary.waterConservationLiters.toLocaleString('en-IN')} L</div>
                <span className="text-[10px] text-slate-400">Agricultural virtual water</span>
              </div>
            </div>
          </div>

          {/* Redistribution Traceability Log */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Certified Redistribution Traceability Log
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">NGO Partner</th>
                    <th className="py-2.5 px-4">Food Item</th>
                    <th className="py-2.5 px-4">Quantity</th>
                    <th className="py-2.5 px-4">Meals Served</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {report.redistributionPartners?.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.ngoName}</td>
                      <td className="py-2.5 px-4">{p.food}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">{p.quantityKg} kg</td>
                      <td className="py-2.5 px-4">{p.meals}</td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Recommendations */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              4. Algorithmic Recommendations for Next Cycle
            </h3>
            <div className="space-y-2">
              {report.actionRecommendations?.map((rec: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            {report.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
