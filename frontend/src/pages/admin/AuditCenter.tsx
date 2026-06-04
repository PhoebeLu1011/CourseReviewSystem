import { useState, useEffect } from "react";
import {
  Eye,
  Trash2,
  AlertTriangle,
  Ban,
  CheckCircle2,
  EyeOff
} from "lucide-react";
import { ReportSidePanel } from "./ReportSidePanel";
import { clsx } from "clsx";
import { API_BASE_URL } from "../../config/api";

// ========== Types ==========
type ReportType = "Review" | "Group" | "Forum";
type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED" | "WITHDRAWN";
type TabStatus = "PENDING" | "RESOLVED" | "DISMISSED" | "WITHDRAWN";

export interface Report {
  id: string;           // 對應後端的 reportID
  reportID: string;
  type: ReportType;
  reported_type: string;
  reason: string;
  reporter: string;     // 對應後端的 reporterID
  reporterID: string;
  timestamp: string;
  content: string;      // 前端顯示用，從後端 description 取
  description?: string;
  reportedUser: string; // 前端顯示用，從後端 reviewID 取
  reviewID: string;
  status: ReportStatus;
  priority: "High" | "Normal";
  resolution?: string;
  handler_id?: string;
}

// 把後端 API 回傳的 report 格式轉成前端用的格式
function mapApiReport(r: any): Report {
  const highPriorityReasons = ["HARASSMENT", "HATE_SPEECH", "OFFENSIVE_CONTENT"];
  return {
    id: r.reportID,
    reportID: r.reportID,
    type: r.reported_type === "review" ? "Review" : r.reported_type === "group" ? "Group" : "Forum",
    reported_type: r.reported_type,
    reason: r.reason,
    reporter: r.reporterID,
    reporterID: r.reporterID,
    timestamp: new Date(r.timestamp).toLocaleString("zh-TW"),
    content: r.description || "（無詳細說明）",
    description: r.description,
    reportedUser: r.reviewID,
    reviewID: r.reviewID,
    status: r.status as ReportStatus,
    priority: highPriorityReasons.includes(r.reason) ? "High" : "Normal",
    resolution: r.resolution,
    handler_id: r.handler_id,
  };
}

// 把前端的 action 字串對應到後端的 decision
function mapActionToDecision(action: string): string {
  switch (action) {
    case "hide":    return "HIDE_REVIEW";
    case "delete":
    case "ban":     return "DELETE_REVIEW";
    case "dismiss": return "DISMISS_REPORT";
    default:        return "DISMISS_REPORT";
  }
}

// ========== Component ==========
export function AuditCenter() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports/all`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReports(data.map(mapApiReport));
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (id: string, action: string) => {
    const labels: Record<string, string> = {
      dismiss: "駁回檢舉",
      hide: "隱藏評價",
      ban: "刪除評價",
      delete: "刪除評價",
    };
    if (!confirm(`確定要「${labels[action] || action}」嗎？`)) return;

    setProcessingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: mapActionToDecision(action),
          handler_id: "admin_001", // TODO: 改成從 auth context 取得的管理員 ID
        }),
      });

      if (res.ok) {
        setSelectedReport(null);
        await fetchReports(); // 重新取得最新資料
      } else {
        const err = await res.json();
        alert(`處理失敗：${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("網路錯誤，請稍後再試");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter(r => r.status === activeTab);

  const countByStatus = (status: TabStatus) => reports.filter(r => r.status === status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <span>載入中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Center</h2>
          <p className="text-sm text-slate-500 mt-1">Manage content reports and user violations</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          {(["PENDING", "RESOLVED", "DISMISSED", "WITHDRAWN"] as TabStatus[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab === "PENDING" ? "Pending" : tab === "RESOLVED" ? "Resolved" : tab === "DISMISSED" ? "Dismissed" : "Withdrawn"}
              {" "}({countByStatus(tab)})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-12"></th>
              <th className="px-6 py-4 font-semibold">Case ID</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Reason</th>
              <th className="px-6 py-4 font-semibold">Reporter</th>
              <th className="px-6 py-4 font-semibold">Timestamp</th>
              {activeTab === "PENDING" && (
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              )}
              {activeTab !== "PENDING" && (
                <th className="px-6 py-4 font-semibold">Resolution</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  {report.priority === "High" ? (
                    <AlertTriangle size={16} className="text-rose-500" title="High Priority" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" title="Normal Priority"></span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {report.id.slice(0, 8)}…
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    report.type === "Review" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    report.type === "Group" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    "bg-orange-50 text-orange-700 border-orange-200"
                  )}>
                    {report.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{report.reason}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{report.reporter}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{report.timestamp}</td>

                {activeTab === "PENDING" && (
                  <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <button
                      onClick={() => setSelectedReport(report)}
                      disabled={processingId === report.id}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "dismiss")}
                      disabled={processingId === report.id}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                      title="Dismiss"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "hide")}
                      disabled={processingId === report.id}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="Hide Content"
                    >
                      <EyeOff size={18} />
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "ban")}
                      disabled={processingId === report.id}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Content"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}

                {activeTab !== "PENDING" && (
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {report.resolution || "—"}
                  </td>
                )}
              </tr>
            ))}

            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 size={48} className="text-slate-200 mb-3" />
                    <p className="text-lg font-medium">No {activeTab.toLowerCase()} reports</p>
                    <p className="text-sm mt-1">Great job keeping the community clean!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
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
