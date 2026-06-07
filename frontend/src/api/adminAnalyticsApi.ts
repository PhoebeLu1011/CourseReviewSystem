import { apiRequest } from "./apiClient";

export type AdminAnalyticsSummary = {
  pendingReports: number;
  totalReports: number;
  activeAnnouncements: number;
};

export async function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  return apiRequest<AdminAnalyticsSummary>("/admin/analytics/summary", {
    auth: true,
    includeContentType: false,
  });
}
