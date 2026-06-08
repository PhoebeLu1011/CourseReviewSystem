import type { FormEvent } from "react";
import { Calendar, Clock, Send } from "lucide-react";
import { clsx } from "clsx";

import type { Audience, Category } from "./announcementEditorTypes";

interface AnnouncementFormPanelProps {
  title: string;
  content: string;
  category: Category;
  audience: Audience;
  isPinned: boolean;
  scheduleDate: string;
  scheduleTime: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onAudienceChange: (value: Audience) => void;
  onPinnedChange: (value: boolean) => void;
  onScheduleDateChange: (value: string) => void;
  onScheduleTimeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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

export function AnnouncementFormPanel({
  title,
  content,
  category,
  audience,
  isPinned,
  scheduleDate,
  scheduleTime,
  isSubmitting,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onAudienceChange,
  onPinnedChange,
  onScheduleDateChange,
  onScheduleTimeChange,
  onSubmit,
}: AnnouncementFormPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto border-r border-slate-100 bg-slate-50/30 p-6 lg:p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <TextField
          label="公告標題"
          value={title}
          onChange={onTitleChange}
          placeholder="例如：本週末系統維護公告"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CategoryPicker category={category} onCategoryChange={onCategoryChange} />
          <AudienceSelect audience={audience} onAudienceChange={onAudienceChange} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            公告內容
          </label>
          <textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="請輸入公告詳細內容..."
            rows={6}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <PublishingOptions
          isPinned={isPinned}
          scheduleDate={scheduleDate}
          scheduleTime={scheduleTime}
          onPinnedChange={onPinnedChange}
          onScheduleDateChange={onScheduleDateChange}
          onScheduleTimeChange={onScheduleTimeChange}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-400"
          >
            <Send size={18} />
            {isSubmitting ? "發布中..." : "發布公告"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        required
      />
    </div>
  );
}

function CategoryPicker({
  category,
  onCategoryChange,
}: {
  category: Category;
  onCategoryChange: (category: Category) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">分類標籤</label>
      <div className="flex gap-2">
        {(["System", "Emergency", "General"] as Category[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onCategoryChange(option)}
            className={clsx(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-all",
              category === option
                ? getCategoryActiveClass(option)
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {CATEGORY_LABEL[option]}
          </button>
        ))}
      </div>
    </div>
  );
}

function AudienceSelect({
  audience,
  onAudienceChange,
}: {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
        發布對象
      </label>
      <select
        value={audience}
        onChange={(event) => onAudienceChange(event.target.value as Audience)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        <option value="All Students">{AUDIENCE_LABEL["All Students"]}</option>
        <option value="Undergraduates">{AUDIENCE_LABEL.Undergraduates}</option>
        <option value="Graduates">{AUDIENCE_LABEL.Graduates}</option>
        <option value="Faculty">{AUDIENCE_LABEL.Faculty}</option>
      </select>
    </div>
  );
}

function PublishingOptions({
  isPinned,
  scheduleDate,
  scheduleTime,
  onPinnedChange,
  onScheduleDateChange,
  onScheduleTimeChange,
}: {
  isPinned: boolean;
  scheduleDate: string;
  scheduleTime: string;
  onPinnedChange: (value: boolean) => void;
  onScheduleDateChange: (value: string) => void;
  onScheduleTimeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800">置頂公告</p>
          <p className="mt-0.5 text-xs text-slate-500">
            將這則公告固定顯示在公告列表最上方
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPinnedChange(!isPinned)}
          className={clsx(
            "relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
            isPinned ? "bg-indigo-600" : "bg-slate-300",
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              isPinned ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      <div className="border-t border-indigo-100/60 pt-4">
        <p className="mb-3 text-sm font-bold text-slate-800">
          排程發布（選填）
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <ScheduleInput
            type="date"
            value={scheduleDate}
            onChange={onScheduleDateChange}
            icon={<Calendar size={16} />}
          />
          <ScheduleInput
            type="time"
            value={scheduleTime}
            onChange={onScheduleTimeChange}
            icon={<Clock size={16} />}
          />
        </div>
      </div>
    </div>
  );
}

function ScheduleInput({
  type,
  value,
  icon,
  onChange,
}: {
  type: "date" | "time";
  value: string;
  icon: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}

function getCategoryActiveClass(category: Category) {
  if (category === "System") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (category === "Emergency") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}