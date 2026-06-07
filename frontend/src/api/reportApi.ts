import type { Report, SubmitReportRequest } from "../models/Report";

import { apiRequest } from "./apiClient";

export type ReportContentResponse = {
  reported_type: string;
  reported_id: string;
  content: Record<string, unknown>;
};

export type ResolveReportRequest = {
  decision: string;
  handler_id?: string | null;
};

// 學生提交檢舉
export async function submitReport(body: SubmitReportRequest): Promise<Report> {
  return apiRequest<Report>("/reports", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

// 取得待審核的檢舉清單（Admin）
export async function getPendingReports(): Promise<Report[]> {
  return apiRequest<Report[]>("/reports/pending", {
    auth: true,
    includeContentType: false,
  });
}

// 取得學生自己的所有檢舉
export async function getMyReports(studentId: string): Promise<Report[]> {
  return apiRequest<Report[]>(`/students/${encodeURIComponent(studentId)}/reports`, {
    auth: true,
    includeContentType: false,
  });
}

export async function getMyReportContent(reportId: string): Promise<ReportContentResponse> {
  return apiRequest<ReportContentResponse>(`/reports/${reportId}/content`, {
    auth: true,
    includeContentType: false,
  });
}

export async function getAllReports(): Promise<Report[]> {
  return apiRequest<Report[]>("/admin/reports/all", {
    auth: true,
    includeContentType: false,
  });
}

export async function getAdminReportContent(reportId: string): Promise<ReportContentResponse> {
  return apiRequest<ReportContentResponse>(`/admin/reports/${reportId}/content`, {
    auth: true,
    includeContentType: false,
  });
}

export async function resolveReport(
  reportId: string,
  body: ResolveReportRequest
): Promise<{ message?: string }> {
  return apiRequest<{ message?: string }>(`/admin/reports/${reportId}/resolve`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}
