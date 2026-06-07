import type { Announcement, CreateAnnouncementRequest } from "../models/Announcement";
import { apiRequest } from "./apiClient";

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return apiRequest<Announcement[]>("/admin/announcements", { auth: true });
}

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  return apiRequest<Announcement[]>("/announcements", { includeContentType: false });
}

export async function createAnnouncement(body: CreateAnnouncementRequest): Promise<Announcement> {
  const data = await apiRequest<{ announcement: Announcement }>("/admin/announcements", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
  return data.announcement;
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await apiRequest<{ message: string }>(`/admin/announcements/${announcementId}`, {
    method: "DELETE",
    auth: true,
  });
}
