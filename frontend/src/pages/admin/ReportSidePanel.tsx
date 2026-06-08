import { X, AlertTriangle, Trash2, EyeOff, ShieldAlert, Check } from "lucide-react";
import type { Report } from "../../components/admin/audit/auditReportUtils";

interface ReportSidePanelProps {
  report: Report;
  onClose: () => void;
  onAction: (id: string, action: string) => void;
}

function getDeleteLabel(report: Report) {
  if (report.reported_type === "review") return "刪除評論";
  if (report.reported_type === "comment") return "刪除留言";
  if (report.reported_type === "teammate_post") return "刪除貼文";
  return "刪除內容";
}

function getHideLabel(report: Report) {
  if (report.reported_type === "review") return "隱藏評論";
  if (report.reported_type === "comment") return "隱藏留言";
  if (report.reported_type === "teammate_post") return "隱藏貼文";
  return "隱藏內容";
}

export function ReportSidePanel({ report, onClose, onAction }: ReportSidePanelProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert size={20} />
            </div>

            <div>
              <h3 className="text-xl font-bold leading-tight text-slate-800">
                案件詳情： {report.id.slice(0, 8)}…
              </h3>

              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  優先順序： {report.priority}
                </span>

                <span className="text-sm font-medium text-slate-500">
                  {report.type}
                </span>

                <span className="font-mono text-xs text-slate-400">
                  {report.reported_id}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="grid h-full min-h-[400px] grid-cols-2 gap-6">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  原始內容
                </h4>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {report.reportedTarget.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold leading-none text-slate-800">
                      {report.type}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      目標 ID： {report.reported_id}
                    </p>
                  </div>
                </div>

                <div className="flex-1 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {report.originalContent || "載入內容中..."}
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50 px-4 py-3">
                <AlertTriangle size={16} className="text-rose-500" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-800">
                  檢舉人主張
                </h4>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {report.reporter.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold leading-none text-slate-800">
                      {report.reporter}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      檢舉時間：{report.timestamp}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-1 text-xs font-bold uppercase text-slate-400">
                    檢舉原因
                  </p>
                  <p className="font-semibold text-rose-700">{report.reason}</p>
                </div>

                <div className="flex-1 rounded-lg border border-rose-100/50 bg-rose-50/50 p-4 text-sm leading-relaxed text-slate-700">
                  <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                    補充說明
                  </p>
                  {report.description || "檢舉人未提供補充說明。"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {report.status === "PENDING" && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white p-6">
            <button
              onClick={() => onAction(report.id, "dismiss")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              type="button"
            >
              <Check size={18} />
              駁回檢舉
            </button>

            <button
              onClick={() => onAction(report.id, "hide")}
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-200"
              type="button"
            >
              <EyeOff size={18} />
              {getHideLabel(report)}
            </button>

            <button
              onClick={() => onAction(report.id, "delete")}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-colors hover:bg-rose-700"
              type="button"
            >
              <Trash2 size={18} />
              {getDeleteLabel(report)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
