import type { Announcement } from "../../models/Announcement";
import {
  ANNOUNCEMENT_CATEGORY_LABEL,
  formatAnnouncementDate,
  getAnnouncementCategory,
} from "./announcementView";

interface AnnouncementDialogProps {
  announcement: Announcement;
  onClose: () => void;
}

export function AnnouncementDialog({
  announcement,
  onClose,
}: AnnouncementDialogProps) {
  const category = getAnnouncementCategory(announcement);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b bg-slate-50 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {ANNOUNCEMENT_CATEGORY_LABEL[category] ?? category}
          </p>
          <p className="text-sm font-medium text-slate-700">
            {formatAnnouncementDate(announcement, {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        <div className="p-6">
          <h3 className="mb-4 text-xl font-bold text-slate-900">
            {announcement.title}
          </h3>
          <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-600">
            {announcement.content}
          </p>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
