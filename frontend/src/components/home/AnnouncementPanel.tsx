import { AlertCircle, Bell, CheckCircle2, Info } from "lucide-react";

import type { Announcement } from "../../models/Announcement";
import {
  formatAnnouncementDate,
  getAnnouncementCategory,
} from "./announcementView";

interface AnnouncementPanelProps {
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;
  onSelect: (announcement: Announcement) => void;
}

export function AnnouncementPanel({
  announcements,
  isLoading,
  error,
  onSelect,
}: AnnouncementPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-slate-800">公告欄</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            最新消息
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading && (
            <div className="p-4 text-sm font-medium text-slate-500">
              載入公告中...
            </div>
          )}

          {!isLoading && error && (
            <div className="flex gap-3 p-4 text-sm font-medium text-rose-600">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && announcements.length === 0 && (
            <div className="p-4 text-sm font-medium text-slate-500">
              目前沒有公告
            </div>
          )}

          {!isLoading &&
            !error &&
            announcements.map((announcement) => (
              <AnnouncementListItem
                key={announcement.announcementID}
                announcement={announcement}
                onSelect={onSelect}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementListItem({
  announcement,
  onSelect,
}: {
  announcement: Announcement;
  onSelect: (announcement: Announcement) => void;
}) {
  return (
    <button
      onClick={() => onSelect(announcement)}
      className="flex w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50"
    >
      <div className="mt-0.5 shrink-0">
        <AnnouncementIcon category={getAnnouncementCategory(announcement)} />
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-800">
            {announcement.title}
          </h4>

          {announcement.is_pinned && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              置頂
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-slate-400">
          {formatAnnouncementDate(announcement, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </button>
  );
}

function AnnouncementIcon({ category }: { category: string }) {
  if (category === "System") {
    return <Info size={18} className="text-blue-500" />;
  }
  if (category === "Emergency") {
    return <AlertCircle size={18} className="text-rose-500" />;
  }
  return <CheckCircle2 size={18} className="text-emerald-500" />;
}
