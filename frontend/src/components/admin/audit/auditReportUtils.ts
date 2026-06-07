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

interface ReportContent {
  content?: string;
  title?: string;
  description?: string;
}

export interface ApiReport {
  reportID: string;
  reported_type?: ReportedType;
  reported_id?: string;
  reason: string;
  reporterID: string;
  timestamp?: string;
  description?: string | null;
  status: ReportStatus;
  resolution?: string | null;
  handler_id?: string | null;
}

export function getContentText(
  reportedType: ReportedType,
  content: ReportContent | null,
) {
  if (!content) return "（內容已刪除或無法載入）";

  if (reportedType === "review" || reportedType === "comment") {
    return content.content || "（此評論沒有文字內容）";
  }

  if (reportedType === "teammate_post") {
    return (
      content.title ||
      content.description ||
      content.content ||
      "（此組員招募沒有文字內容）"
    );
  }

  return "（內容無法顯示）";
}

export function mapApiReport(report: ApiReport): Report {
  const highPriorityReasons = ["HARASSMENT", "HATE_SPEECH", "OFFENSIVE_CONTENT"];
  const reportedType = (report.reported_type || "review") as ReportedType;
  const reportedId = report.reported_id || "";

  return {
    id: report.reportID,
    reportID: report.reportID,
    type: getTypeLabel(reportedType),
    reported_type: reportedType,
    reported_id: reportedId,
    reason: report.reason,
    reporter: report.reporterID,
    reporterID: report.reporterID,
    rawTimestamp: report.timestamp || "",
    timestamp: report.timestamp
      ? new Date(report.timestamp).toLocaleString("zh-TW")
      : "未知時間",
    content: report.description || "（無詳細說明）",
    originalContent: undefined,
    description: report.description,
    reportedTarget: reportedId,
    status: report.status as ReportStatus,
    priority: highPriorityReasons.includes(report.reason) ? "High" : "Normal",
    resolution: report.resolution,
    handler_id: report.handler_id,
  };
}

export function mapActionToDecision(report: Report, action: string) {
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

export function getActionLabel(report: Report, action: string) {
  if (action === "dismiss") return "駁回檢舉";

  if (report.reported_type === "review") {
    return action === "hide" ? "隱藏評論" : "刪除評論";
  }

  if (report.reported_type === "comment") {
    return action === "hide" ? "隱藏回覆" : "刪除回覆";
  }

  if (report.reported_type === "teammate_post") {
    return action === "hide" ? "隱藏組員招募" : "刪除組員招募";
  }

  return action;
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
