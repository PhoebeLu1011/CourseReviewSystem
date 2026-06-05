import type { Announcement, CreateAnnouncementRequest } from "../models/Announcement";
import { API_BASE_URL } from "../config/api";

// 取得所有公告（管理員用）
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

// 取得公開公告（首頁用）
export async function getPublicAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/announcements`);
  if (!res.ok) throw new Error("Failed to fetch public announcements");
  return res.json();
}

// 發布新公告
export async function createAnnouncement(body: CreateAnnouncementRequest): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create announcement");
  const data = await res.json();
  return data.announcement;
}

// 刪除公告
export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements/${announcementId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
}
