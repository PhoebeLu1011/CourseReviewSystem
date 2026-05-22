import type { Report, SubmitReportRequest } from "../models/Report";

const BASE_URL = "http://localhost:5000";

// 學生提交檢舉
export async function submitReport(body: SubmitReportRequest): Promise<Report> {
    const res = await fetch(`${BASE_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (res.status === 409) throw new Error("Already reported this review");
    if (!res.ok) throw new Error("Failed to submit report");
    return res.json();
}

// 取得待審核的檢舉清單（Admin）
export async function getPendingReports(): Promise<Report[]> {
    const res = await fetch(`${BASE_URL}/reports/pending`);
    if (!res.ok) throw new Error("Failed to fetch pending reports");
    return res.json();
}
