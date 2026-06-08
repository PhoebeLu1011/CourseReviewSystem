import { clsx } from "clsx";

import type { AnnouncementEditorView } from "./announcementEditorTypes";

interface AnnouncementEditorHeaderProps {
  view: AnnouncementEditorView;
  announcementCount: number;
  onViewChange: (view: AnnouncementEditorView) => void;
}

export function AnnouncementEditorHeader({
  view,
  announcementCount,
  onViewChange,
}: AnnouncementEditorHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-8 pb-0 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          建立公告
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          撰寫公告內容，並發布或排程給學生查看
        </p>
      </div>

      <div className="mb-0 flex gap-2">
        <EditorTab
          active={view === "form"}
          label="＋ 新增公告"
          onClick={() => onViewChange("form")}
        />
        <EditorTab
          active={view === "list"}
          label={`所有公告 (${announcementCount})`}
          onClick={() => onViewChange("list")}
        />
      </div>
    </div>
  );
}

function EditorTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-all",
        active
          ? "border-indigo-600 text-indigo-700"
          : "border-transparent text-slate-500 hover:text-slate-700",
      )}
    >
      {label}
    </button>
  );
}
