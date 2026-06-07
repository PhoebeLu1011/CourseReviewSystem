import { AlertCircle, CheckCircle2, Info, Pin, Smartphone } from "lucide-react";
import { clsx } from "clsx";

import type { Audience, Category } from "./announcementEditorTypes";
import { formatPreviewDate } from "./announcementEditorTypes";

interface AnnouncementPreviewProps {
  title: string;
  content: string;
  category: Category;
  audience: Audience;
  isPinned: boolean;
  scheduleDate: string;
}

export function AnnouncementPreview({
  title,
  content,
  category,
  audience,
  isPinned,
  scheduleDate,
}: AnnouncementPreviewProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center border-l border-slate-200 bg-slate-100 p-6 lg:w-[400px] lg:p-8">
      <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <Smartphone size={16} />
        Live Mobile Preview
      </div>

      <div className="relative flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[40px] border-[8px] border-slate-800 bg-white shadow-2xl">
        <div className="z-10 flex h-7 w-full shrink-0 items-center justify-between bg-white px-5 pt-1 text-[10px] font-bold text-slate-800">
          <span>9:41</span>
        </div>
        <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-800" />
        <div className="mt-3 shrink-0 bg-indigo-600 px-5 pb-4 pt-6 text-white shadow-sm">
          <h1 className="text-lg font-bold">NTNU Announcements</h1>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div
            className={clsx(
              "rounded-xl border bg-white p-4 shadow-sm",
              category === "Emergency" ? "border-rose-200" : "border-slate-100",
            )}
          >
            <div className="mb-2 flex items-start justify-between">
              <CategoryBadge category={category} />
              {isPinned && (
                <Pin
                  size={14}
                  className="shrink-0 rotate-45 fill-amber-500 text-amber-500"
                />
              )}
            </div>

            <h3 className="mb-2 text-sm font-bold leading-tight text-slate-800">
              {title || "Untitled Announcement"}
            </h3>
            <p className="line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
              {content || "Preview your message content here as you type..."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
              <span>{audience}</span>
              <span>{formatPreviewDate(scheduleDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        category === "System"
          ? "bg-indigo-100 text-indigo-700"
          : category === "Emergency"
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700",
      )}
    >
      {category === "System" && <Info size={10} />}
      {category === "Emergency" && <AlertCircle size={10} />}
      {category === "General" && <CheckCircle2 size={10} />}
      {category}
    </span>
  );
}
