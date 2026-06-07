import type { Announcement } from "../../models/Announcement";

export const ANNOUNCEMENT_CATEGORY_LABEL: Record<string, string> = {
  System: "系統公告",
  Emergency: "重要通知",
  General: "一般公告",
};

export function getAnnouncementCategory(announcement: Announcement) {
  return announcement.tags?.[0] ?? "General";
}

export function getAnnouncementDate(announcement: Announcement) {
  return announcement.scheduled_at || announcement.created_at;
}

export function formatAnnouncementDate(
  announcement: Announcement,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(getAnnouncementDate(announcement));

  if (Number.isNaN(date.getTime())) {
    return "日期未定";
  }

  return date.toLocaleDateString("zh-TW", options);
}
