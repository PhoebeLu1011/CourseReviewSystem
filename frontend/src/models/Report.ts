export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED" | "WITHDRAWN";

export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH" 
  | "OFFENSIVE_CONTENT"
  | "FALSE_INFORMATION"
  | "INAPPROPRIATE_LANGUAGE"
  | "OTHER";

export type ReportedType = "review" | "comment" | "teammate_post";

export interface Report {
  reportID: string;
  reporterID: string;

  reported_type: ReportedType;
  reported_id: string;

  reason: ReportReason;
  description?: string | null;

  status: ReportStatus;
  handler_id?: string | null;
  resolution?: string | null;
  timestamp: string;
}

export interface SubmitReportRequest {
  reporterID: string;
  reported_type: ReportedType;
  reported_id: string;
  reason: ReportReason;
  description?: string;
}
