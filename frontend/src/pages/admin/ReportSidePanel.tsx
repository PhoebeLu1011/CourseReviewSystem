import { X, AlertTriangle, Ban, EyeOff, ShieldAlert, Check } from "lucide-react";
import { Report } from "./AuditCenter";

interface ReportSidePanelProps {
  report: Report;
  onClose: () => void;
  onAction: (id: string, action: string) => void;
}

export function ReportSidePanel({ report, onClose, onAction }: ReportSidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">
                Case Details: {report.id}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                  Priority: {report.reason.includes("Harassment") || report.reason.includes("Hate") ? "High" : "Normal"}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {report.type}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-2 gap-6 h-full min-h-[400px]">
            {/* Left Column: Original Post */}
            <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Original Content</h4>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {report.reportedUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm leading-none">{report.reportedUser}</p>
                    <p className="text-xs text-slate-500 mt-1">Posted on {report.timestamp}</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </div>
              </div>
            </div>

            {/* Right Column: Reporter's Claim */}
            <div className="flex flex-col h-full bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <h4 className="font-bold text-rose-800 text-sm uppercase tracking-wider">Reporter's Claim</h4>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {report.reporter.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm leading-none">{report.reporter}</p>
                    <p className="text-xs text-slate-500 mt-1">Reported on {report.timestamp}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Report Reason</p>
                  <p className="font-semibold text-rose-700">{report.reason}</p>
                </div>
                
                <div className="flex-1 bg-rose-50/50 p-4 rounded-lg border border-rose-100/50 text-slate-700 text-sm leading-relaxed">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Additional Details</p>
                  {report.description || "No additional details provided by the reporter."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end items-center gap-3 shrink-0">
          <button 
            onClick={() => onAction(report.id, "dismiss")}
            className="px-5 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Check size={18} /> Dismiss
          </button>
          
          <button 
            onClick={() => onAction(report.id, "hide")}
            className="px-5 py-2.5 flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-200 shadow-sm"
          >
            <EyeOff size={18} /> Hide Content
          </button>
          
          <button 
            onClick={() => onAction(report.id, "ban")}
            className="px-5 py-2.5 flex items-center gap-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm shadow-rose-200"
          >
            <Ban size={18} /> Ban User
          </button>
        </div>
      </div>
    </>
  );
}
