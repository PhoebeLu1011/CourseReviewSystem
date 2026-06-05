import { API_BASE_URL } from "../config/api";
import type { Application } from "../models/Application";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `API request failed: ${path}`);
  }

  return data as T;
}

export async function getPendingApplications(studentId: string) {
  return request<Application[]>(
    `/students/${encodeURIComponent(studentId)}/applications/pending`
  );
}

export async function createApplication(payload: {
  student_id: string;
  group_id: string;
  message: string;
}) {
  return request<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}