import type { Announcement, CreateAnnouncementRequest } from "../models/Announcement";
import { API_BASE_URL } from "../config/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/announcements`);
  if (!res.ok) throw new Error("Failed to fetch public announcements");
  return res.json();
}

export async function createAnnouncement(body: CreateAnnouncementRequest): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create announcement");
  const data = await res.json();
  return data.announcement;
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/announcements/${announcementId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
}
