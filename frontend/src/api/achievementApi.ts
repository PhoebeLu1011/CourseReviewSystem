import { apiRequest } from "./apiClient";
import type {
  StudentBadgesResponse,
  AchievementScoreResponse,
  CheckBadgesResponse,
} from "../models/Achievement";

export async function getStudentBadges(studentId: string) {
  return apiRequest<StudentBadgesResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/badges`,
    { auth: true }
  );
}

export async function getAchievementScore(studentId: string) {
  return apiRequest<AchievementScoreResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/score`,
    { auth: true }
  );
}

export async function checkStudentBadges(studentId: string) {
  return apiRequest<CheckBadgesResponse>(
    `/achievements/students/${encodeURIComponent(studentId)}/badges/check`,
    {
      method: "POST",
      auth: true,
    }
  );
}
