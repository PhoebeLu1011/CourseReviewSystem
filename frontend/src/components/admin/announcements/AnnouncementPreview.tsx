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

const CATEGORY_LABEL: Record<Category, string> = {
  System: "系統",
  Emergency: "緊急",
  General: "一般",
};

const AUDIENCE_LABEL: Record<Audience, string> = {
  "All Students": "所有學生",
  Undergraduates: "大學生",
  Graduates: "研究生",
  Faculty: "教職員",
};

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
        手機即時預覽
      </div>

      <div className="relative flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[40px] border-[8px] border-slate-800 bg-white shadow-2xl">
        <div className="z-10 flex h-7 w-full shrink-0 items-center justify-between bg-white px-5 pt-1 text-[10px] font-bold text-slate-800">
          <span>9:41</span>
        </div>
        <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-800" />
        <div className="mt-3 shrink-0 bg-indigo-600 px-5 pb-4 pt-6 text-white shadow-sm">
          <h1 className="text-lg font-bold">NTNU 公告</h1>
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
              {title || "未命名公告"}
            </h3>
            <p className="line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
              {content || "輸入內容後，這裡會即時顯示公告預覽..."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
              <span>{AUDIENCE_LABEL[audience]}</span>
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
      {CATEGORY_LABEL[category]}
    </span>
  );
}