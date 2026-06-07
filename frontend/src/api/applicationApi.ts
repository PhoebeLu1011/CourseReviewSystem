import type { Application } from "../models/Application";
import { apiRequest } from "./apiClient";

export async function getPendingApplications(studentId: string) {
  return apiRequest<Application[]>(
    `/students/${encodeURIComponent(studentId)}/applications/pending`,
    { auth: true }
  );
}

export async function createApplication(payload: {
  group_id: string;
  message: string;
}) {
  return apiRequest<Application>("/applications", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function approveApplication(applicationId: string) {
  return apiRequest<Application>(
    `/applications/${encodeURIComponent(applicationId)}/approve`,
    { method: "POST", auth: true }
  );
}

export async function rejectApplication(applicationId: string) {
  return apiRequest<Application>(
    `/applications/${encodeURIComponent(applicationId)}/reject`,
    { method: "POST", auth: true }
  );
}

export async function cancelApplication(applicationId: string) {
  return apiRequest<Application>(
    `/applications/${encodeURIComponent(applicationId)}/cancel`,
    { method: "POST", auth: true }
  );
}
