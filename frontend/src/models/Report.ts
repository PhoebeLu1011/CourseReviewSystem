export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export class Report {
    public reportID: string;
    public reviewID: string;     // The review being flagged
    public reporterID: string;   // The student who submitted the report
    public reason: string;       // E.g., "Inappropriate language", "Spam"
    public status: ReportStatus;
    public timestamp: Date;

    constructor(id: string, reviewID: string, reporterID: string, reason: string) {
        this.reportID = id;
        this.reviewID = reviewID;
        this.reporterID = reporterID;
        this.reason = reason;
        this.status = "PENDING"; // Automatically enters the queue as pending
        this.timestamp = new Date();
    }
}