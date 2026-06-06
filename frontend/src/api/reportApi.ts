import type { Report, SubmitReportRequest } from "../models/Report";

import { API_BASE_URL } from "../config/api";
const BASE_URL = API_BASE_URL;

// 學生提交檢舉
export async function submitReport(body: SubmitReportRequest): Promise<Report> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(body),
    });
    if (res.status === 409) throw new Error("Already reported this review");
    if (!res.ok) throw new Error("Failed to submit report");
    return res.json();
}

// 取得待審核的檢舉清單（Admin）
export async function getPendingReports(): Promise<Report[]> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/reports/pending`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (!res.ok) throw new Error("Failed to fetch pending reports");
    return res.json();
}

// 取得學生自己的所有檢舉
export async function getMyReports(studentId: string): Promise<Report[]> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/students/${studentId}/reports`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });
    if (!res.ok) throw new Error("Failed to fetch my reports");
    return res.json();
}
