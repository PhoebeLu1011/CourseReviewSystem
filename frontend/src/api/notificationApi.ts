import type { Notification } from "../models/Notification";
import { apiRequest } from "./apiClient";

export async function getNotifications(studentId: string): Promise<Notification[]> {
  return apiRequest<Notification[]>(
    `/students/${encodeURIComponent(studentId)}/notifications`,
    { auth: true, includeContentType: false }
  );
}

export async function getUnreadNotifications(studentId: string): Promise<Notification[]> {
  return apiRequest<Notification[]>(
    `/students/${encodeURIComponent(studentId)}/notifications/unread`,
    { auth: true, includeContentType: false }
  );
}

export async function markNotificationRead(notificationId: string): Promise<Notification> {
  return apiRequest<Notification>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "POST", auth: true }
  );
}
