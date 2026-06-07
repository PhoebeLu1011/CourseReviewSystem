import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Trash2 } from "lucide-react";

import type { Report, TabStatus } from "./auditReportUtils";

interface AuditReportsTableProps {
  reports: Report[];
  activeTab: TabStatus;
  processingId: string | null;
  onViewReport: (report: Report) => void;
  onAction: (id: string, action: string) => void;
}

export function AuditReportsTable({
  reports,
  activeTab,
  processingId,
  onViewReport,
  onAction,
}: AuditReportsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
            <th className="w-12 px-6 py-4 font-semibold" />
            <th className="px-6 py-4 font-semibold">Case ID</th>
            <th className="px-6 py-4 font-semibold">Type</th>
            <th className="px-6 py-4 font-semibold">Target ID</th>
            <th className="px-6 py-4 font-semibold">Reason</th>
            <th className="px-6 py-4 font-semibold">Reporter</th>
            <th className="px-6 py-4 font-semibold">Timestamp</th>
            {activeTab === "PENDING" ? (
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            ) : (
              <th className="px-6 py-4 font-semibold">Resolution</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => (
            <AuditReportRow
              key={report.id}
              report={report}
              activeTab={activeTab}
              isProcessing={processingId === report.id}
              onViewReport={onViewReport}
              onAction={onAction}
            />
          ))}

          {reports.length === 0 && <EmptyReportsRow activeTab={activeTab} />}
        </tbody>
      </table>
    </div>
  );
}

function AuditReportRow({
  report,
  activeTab,
  isProcessing,
  onViewReport,
  onAction,
}: {
  report: Report;
  activeTab: TabStatus;
  isProcessing: boolean;
  onViewReport: (report: Report) => void;
  onAction: (id: string, action: string) => void;
}) {
  return (
    <tr className="group transition-colors hover:bg-slate-50/80">
      <td className="px-6 py-4">
        {report.priority === "High" ? (
          <span title="High Priority">
            <AlertTriangle
              size={16}
              className="text-rose-500"
              aria-label="High Priority"
            />
          </span>
        ) : (
          <span
            className="inline-block h-2 w-2 rounded-full bg-slate-300"
            title="Normal Priority"
          />
        )}
      </td>

      <td className="px-6 py-4">
        <span className="font-mono text-sm font-medium text-slate-700">
          {report.id.slice(0, 8)}…
        </span>
      </td>

      <td className="px-6 py-4">
        <ReportTypeBadge report={report} />
      </td>

      <td className="px-6 py-4">
        <span className="font-mono text-xs text-slate-500">
          {report.reported_id || "—"}
        </span>
      </td>

      <td className="px-6 py-4 text-sm font-medium text-slate-800">
        {report.reason}
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">{report.reporter}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{report.timestamp}</td>

      {activeTab === "PENDING" ? (
        <td className="flex justify-end space-x-1 px-6 py-4 text-right opacity-0 transition-opacity group-hover:opacity-100">
          <ActionButton
            title="View Details"
            className="text-indigo-600 hover:bg-indigo-50"
            disabled={isProcessing}
            onClick={() => onViewReport(report)}
            icon={<Eye size={18} />}
          />
          <ActionButton
            title="Dismiss"
            className="text-slate-500 hover:bg-slate-100"
            disabled={isProcessing}
            onClick={() => onAction(report.id, "dismiss")}
            icon={<CheckCircle2 size={18} />}
          />
          <ActionButton
            title="Hide Content"
            className="text-amber-600 hover:bg-amber-50"
            disabled={isProcessing}
            onClick={() => onAction(report.id, "hide")}
            icon={<EyeOff size={18} />}
          />
          <ActionButton
            title="Delete Content"
            className="text-rose-600 hover:bg-rose-50"
            disabled={isProcessing}
            onClick={() => onAction(report.id, "delete")}
            icon={<Trash2 size={18} />}
          />
        </td>
      ) : (
        <td className="px-6 py-4 text-sm text-slate-500">
          {report.resolution || "—"}
        </td>
      )}
    </tr>
  );
}

function ReportTypeBadge({ report }: { report: Report }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        report.type === "Review"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : report.type === "Group"
            ? "border-purple-200 bg-purple-50 text-purple-700"
            : "border-orange-200 bg-orange-50 text-orange-700",
      )}
    >
      {report.type}
    </span>
  );
}

function ActionButton({
  title,
  className,
  disabled,
  icon,
  onClick,
}: {
  title: string;
  className: string;
  disabled: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx("rounded-md p-1.5 transition-colors", className)}
      title={title}
    >
      {icon}
    </button>
  );
}

function EmptyReportsRow({ activeTab }: { activeTab: TabStatus }) {
  return (
    <tr>
      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center">
          <CheckCircle2 size={48} className="mb-3 text-slate-200" />
          <p className="text-lg font-medium">
            No {activeTab.toLowerCase()} reports
          </p>
          <p className="mt-1 text-sm">Great job keeping the community clean!</p>
        </div>
      </td>
    </tr>
  );
}
