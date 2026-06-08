import { clsx } from "clsx";

import type { TabStatus } from "./auditReportUtils";

const TABS: TabStatus[] = ["PENDING", "RESOLVED", "DISMISSED", "WITHDRAWN"];

const TAB_LABEL: Record<TabStatus, string> = {
  PENDING: "待處理",
  RESOLVED: "已處理",
  DISMISSED: "已駁回",
  WITHDRAWN: "已撤回",
};

interface AuditCenterHeaderProps {
  activeTab: TabStatus;
  countByStatus: (status: TabStatus) => number;
  onTabChange: (tab: TabStatus) => void;
}

export function AuditCenterHeader({
  activeTab,
  countByStatus,
  onTabChange,
}: AuditCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">審核中心</h2>
        <p className="mt-1 text-sm text-slate-500">
          管理內容檢舉與使用者違規案件
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={clsx(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {TAB_LABEL[tab]} ({countByStatus(tab)})
          </button>
        ))}
      </div>
    </div>
  );
}