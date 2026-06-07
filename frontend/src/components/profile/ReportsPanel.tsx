import { AlertTriangle } from "lucide-react";

import type { Report } from "../../models/Report";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

const REASON_LABEL: Record<string, string> = {
  SPAM: "垃圾內容",
  HARASSMENT: "騷擾或霸凌",
  OFFENSIVE_CONTENT: "不當內容",
  FALSE_INFORMATION: "虛假資訊",
  INAPPROPRIATE_LANGUAGE: "不當用語",
  OTHER: "其他",
};
const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
  DISMISSED: "border-slate-200 bg-slate-50 text-slate-500",
  WITHDRAWN: "border-blue-200 bg-blue-50 text-blue-600",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "審核中",
  RESOLVED: "已處理",
  DISMISSED: "已駁回",
  WITHDRAWN: "已撤回",
};
const TYPE_LABEL: Record<string, string> = {
  review: "課程評論",
  comment: "討論回覆",
  teammate_post: "組員招募",
};

interface ReportsPanelProps {
  reports: Report[];
  contents: Record<string, string>;
  isLoading: boolean;
}

export function ReportsPanel({ reports, contents, isLoading }: ReportsPanelProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">載入中...</p>;
  }
  if (reports.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 shadow-none">
        <CardContent className="p-8 text-center text-sm text-slate-500">
          尚未提交任何檢舉。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.reportID} className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-2xl bg-amber-50 p-3 text-amber-700">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {REASON_LABEL[report.reason] || report.reason}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {TYPE_LABEL[report.reported_type] || report.reported_type}
                </p>
                {contents[report.reportID] ? (
                  <p className="mt-1.5 max-w-md line-clamp-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {contents[report.reportID]}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs italic text-slate-400">
                    （內容已刪除或無法載入）
                  </p>
                )}
                <p className="mt-1 font-mono text-xs text-slate-400">
                  {new Date(report.timestamp).toLocaleDateString("zh-TW")}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 rounded-lg font-bold ${STATUS_STYLE[report.status] || ""}`}
            >
              {STATUS_LABEL[report.status] || report.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
