import { useEffect, useState } from "react";

import {
  getAdminReportContent,
  getAllReports,
  resolveReport,
} from "../../api/reportApi";
import { AuditCenterHeader } from "../../components/admin/audit/AuditCenterHeader";
import { AuditReportsTable } from "../../components/admin/audit/AuditReportsTable";
import {
  getActionLabel,
  getContentText,
  mapActionToDecision,
  mapApiReport,
  type Report,
  type TabStatus,
} from "../../components/admin/audit/auditReportUtils";
import { useAuth } from "../../context/AuthContext";
import { ReportSidePanel } from "./ReportSidePanel";

export type { Report } from "../../components/admin/audit/auditReportUtils";

export function AuditCenter() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);

    try {
      const data = await getAllReports();
      setReports(data.map(mapApiReport));
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportContent = async (report: Report) => {
    try {
      const data = await getAdminReportContent(report.reportID);

      setSelectedReport({
        ...report,
        originalContent: getContentText(report.reported_type, data.content),
      });
    } catch (err) {
      console.error("Error fetching report content:", err);
      setSelectedReport({
        ...report,
        originalContent: "（內容載入失敗）",
      });
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    void fetchReportContent(report);
  };

  const handleAction = async (id: string, action: string) => {
    const targetReport =
      selectedReport?.id === id
        ? selectedReport
        : reports.find((report) => report.id === id);

    if (!targetReport) return;

    const label = getActionLabel(targetReport, action);
    if (!confirm(`確定要「${label}」嗎？`)) return;

    setProcessingId(id);

    try {
      await resolveReport(id, {
        decision: mapActionToDecision(targetReport, action),
        handler_id: user?.account ?? null,
      });

      setSelectedReport(null);
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? `處理失敗：${err.message}` : "網路錯誤，請稍後再試");
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
        <span>載入中...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-white">
      <AuditCenterHeader
        activeTab={activeTab}
        countByStatus={countByStatus}
        onTabChange={setActiveTab}
      />

      <AuditReportsTable
        reports={filteredReports}
        activeTab={activeTab}
        processingId={processingId}
        onViewReport={handleViewReport}
        onAction={handleAction}
      />

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
