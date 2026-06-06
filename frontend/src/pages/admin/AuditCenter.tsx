import { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  EyeOff,
} from "lucide-react";
import { ReportSidePanel } from "./ReportSidePanel";
import { clsx } from "clsx";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export type ReportedType = "review" | "comment" | "teammate_post";
export type ReportTypeLabel = "Review" | "Comment" | "Group";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED" | "WITHDRAWN";
export type TabStatus = ReportStatus;

export interface Report {
  id: string;
  reportID: string;

  type: ReportTypeLabel;
  reported_type: ReportedType;
  reported_id: string;

  reason: string;
  reporter: string;
  reporterID: string;

  timestamp: string;
  rawTimestamp: string;

  content: string;
  originalContent?: string;
  description?: string | null;

  reportedTarget: string;
  status: ReportStatus;
  priority: "High" | "Normal";

  resolution?: string | null;
  handler_id?: string | null;
}

function getTypeLabel(reportedType: string): ReportTypeLabel {
  switch (reportedType) {
    case "review":
      return "Review";
    case "comment":
      return "Comment";
    case "teammate_post":
      return "Group";
    default:
      return "Review";
  }
}

function getContentText(reportedType: ReportedType, content: any): string {
  if (!content) return "（Content deleted or unavailable）";

  if (reportedType === "review") {
    return content.content || "（No text content in this review）";
  }

  if (reportedType === "comment") {
    return content.content || "（No text content in this comment）";
  }

  if (reportedType === "teammate_post") {
    return content.title || content.description || content.content || "（No text content in this post）";
  }

  return "（Content cannot be displayed）";
}

function mapApiReport(r: any): Report {
  const highPriorityReasons = ["HARASSMENT", "HATE_SPEECH", "OFFENSIVE_CONTENT"];
  const reportedType = (r.reported_type || "review") as ReportedType;
  const reportedId = r.reported_id || "";

  return {
    id: r.reportID,
    reportID: r.reportID,

    type: getTypeLabel(reportedType),
    reported_type: reportedType,
    reported_id: reportedId,

    reason: r.reason,
    reporter: r.reporterID,
    reporterID: r.reporterID,

    rawTimestamp: r.timestamp,
    timestamp: r.timestamp ? new Date(r.timestamp).toLocaleString("zh-TW") : "Unknown time",

    content: r.description || "（No description）",
    originalContent: undefined,
    description: r.description,

    reportedTarget: reportedId,
    status: r.status as ReportStatus,
    priority: highPriorityReasons.includes(r.reason) ? "High" : "Normal",

    resolution: r.resolution,
    handler_id: r.handler_id,
  };
}

function mapActionToDecision(report: Report, action: string): string {
  if (action === "dismiss") return "DISMISS_REPORT";

  if (report.reported_type === "review") {
    if (action === "hide") return "HIDE_REVIEW";
    if (action === "delete") return "DELETE_REVIEW";
  }

  if (report.reported_type === "comment") {
    if (action === "hide") return "HIDE_COMMENT";
    if (action === "delete") return "DELETE_COMMENT";
  }

  if (report.reported_type === "teammate_post") {
    if (action === "hide") return "HIDE_TEAMMATE_POST";
    if (action === "delete") return "DELETE_TEAMMATE_POST";
  }

  return "DISMISS_REPORT";
}

function getActionLabel(report: Report, action: string): string {
  if (action === "dismiss") return "Dismiss report";

  if (report.reported_type === "review") {
    return action === "hide" ? "Hide review" : "delete review";
  }

  if (report.reported_type === "comment") {
    return action === "hide" ? "Hide comment" : "delete comment";
  }

  if (report.reported_type === "teammate_post") {
    return action === "hide" ? "Hide post" : "delete post";
  }

  return action;
}

export function AuditCenter() {
  const {user} = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/reports/all`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      setReports(data.map(mapApiReport));
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportContent = async (report: Report) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/reports/${report.reportID}/content`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
      });

      if (!res.ok) {
        setSelectedReport({
          ...report,
          originalContent: "（Content deleted or unavailable.）",
        });
        return;
      }

      const data = await res.json();

      setSelectedReport({
        ...report,
        originalContent: getContentText(report.reported_type, data.content),
      });
    } catch (err) {
      console.error("Error fetching report content:", err);
      setSelectedReport({
        ...report,
        originalContent: "（Failed to load content.）",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    fetchReportContent(report);
  };

  const handleAction = async (id: string, action: string) => {
    const targetReport =
      selectedReport?.id === id
        ? selectedReport
        : reports.find((report) => report.id === id);

    if (!targetReport) return;

    const label = getActionLabel(targetReport, action);

    if (!confirm(`Are you sure you want to "${label}"?`)) return;

    setProcessingId(id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          decision: mapActionToDecision(targetReport, action),
          handler_id: user?.account ?? null,
        }),
      });

      if (res.ok) {
        setSelectedReport(null);
        await fetchReports();
      } else {
        const err = await res.json();
        alert(`Action failed: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error, please try again");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter((report) => report.status === activeTab);
  const countByStatus = (status: TabStatus) =>
    reports.filter((report) => report.status === status).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage content reports and user violations
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
          {(["PENDING", "RESOLVED", "DISMISSED", "WITHDRAWN"] as TabStatus[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab === "PENDING"
                  ? "Pending"
                  : tab === "RESOLVED"
                    ? "Resolved"
                    : tab === "DISMISSED"
                      ? "Dismissed"
                      : "Withdrawn"}{" "}
                ({countByStatus(tab)})
              </button>
            ),
          )}
        </div>
      </div>

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
            {filteredReports.map((report) => (
              <tr
                key={report.id}
                className="group transition-colors hover:bg-slate-50/80"
              >
                <td className="px-6 py-4">
                  {report.priority === "High" ? (
                    <AlertTriangle
                      size={16}
                      className="text-rose-500"
                      title="High Priority"
                    />
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
                </td>

                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-slate-500">
                    {report.reported_id || "—"}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {report.reason}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {report.reporter}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {report.timestamp}
                </td>

                {activeTab === "PENDING" ? (
                  <td className="flex justify-end space-x-1 px-6 py-4 text-right opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleViewReport(report)}
                      disabled={processingId === report.id}
                      className="rounded-md p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(report.id, "dismiss")}
                      disabled={processingId === report.id}
                      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                      title="Dismiss"
                    >
                      <CheckCircle2 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(report.id, "hide")}
                      disabled={processingId === report.id}
                      className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                      title="Hide Content"
                    >
                      <EyeOff size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(report.id, "delete")}
                      disabled={processingId === report.id}
                      className="rounded-md p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                      title="Delete Content"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                ) : (
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {report.resolution || "—"}
                  </td>
                )}
              </tr>
            ))}

            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 size={48} className="mb-3 text-slate-200" />
                    <p className="text-lg font-medium">
                      No {activeTab.toLowerCase()} reports
                    </p>
                    <p className="mt-1 text-sm">
                      Great job keeping the community clean!
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <ReportSidePanel
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
