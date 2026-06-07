import { Trash2 } from "lucide-react";
import { clsx } from "clsx";

import type { Announcement } from "../../../models/Announcement";

interface AnnouncementListProps {
  announcements: Announcement[];
  onDelete: (id: string) => void;
}

export function AnnouncementList({
  announcements,
  onDelete,
}: AnnouncementListProps) {
  return (
    <div className="space-y-4 overflow-y-auto p-6">
      {announcements.length === 0 ? (
        <div className="py-16 text-center text-slate-400">目前沒有任何公告</div>
      ) : (
        announcements.map((announcement) => (
          <AnnouncementListItem
            key={announcement.announcementID}
            announcement={announcement}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

function AnnouncementListItem({
  announcement,
  onDelete,
}: {
  announcement: Announcement;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {announcement.is_pinned && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                置頂
              </span>
            )}

            {(announcement.tags || []).map((tag) => (
              <span
                key={tag}
                className={clsx(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  tag === "System"
                    ? "bg-indigo-100 text-indigo-700"
                    : tag === "Emergency"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700",
                )}
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-800">
            {announcement.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {announcement.content}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {announcement.created_at
              ? new Date(announcement.created_at).toLocaleString("zh-TW")
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(announcement.announcementID)}
          className="ml-4 rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          title="刪除公告"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
