export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export type ReportReason =
    | "SPAM"
    | "HARASSMENT"
    | "OFFENSIVE_CONTENT"
    | "FALSE_INFORMATION"
    | "INAPPROPRIATE_LANGUAGE"
    | "OTHER";

export interface Report {
    reportID: string;
    reviewID: string;
    reporterID: string;
    reason: ReportReason;
    status: ReportStatus;
    timestamp: string;
}

export interface SubmitReportRequest {
    reporterID: string;
    reviewID: string;
    reason: ReportReason;
}
