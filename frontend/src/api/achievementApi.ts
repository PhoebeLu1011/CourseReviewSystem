import { API_BASE_URL } from "../config/api";
import type {
  StudentBadgesResponse,
  AchievementScoreResponse,
  CheckBadgesResponse,
} from "../models/Achievement";

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
    throw new Error(data?.message || data?.error || `API request failed: ${path}`);
  }

  return data as T;
}

export async function getStudentBadges(studentId: string) {
  return request<StudentBadgesResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/badges`
  );
}

export async function getAchievementScore(studentId: string) {
  return request<AchievementScoreResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/score`
  );
}

export async function checkStudentBadges(studentId: string) {
  return request<CheckBadgesResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/badges/check`,
    {
      method: "POST",
    }
  );
}