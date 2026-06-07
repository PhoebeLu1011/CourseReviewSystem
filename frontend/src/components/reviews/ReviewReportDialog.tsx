import { X } from "lucide-react";

import type { ReportReason } from "../../models/Report";
import { REPORT_REASONS } from "./reviewOptions";

interface ReviewReportDialogProps {
  reason: ReportReason;
  isSubmitting: boolean;
  onReasonChange: (reason: ReportReason) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ReviewReportDialog({
  reason,
  isSubmitting,
  onReasonChange,
  onCancel,
  onSubmit,
}: ReviewReportDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">檢舉評論</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">請選擇檢舉原因：</p>
        <div className="space-y-2">
          {REPORT_REASONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
            >
              <input
                type="radio"
                name="reportReason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => onReasonChange(option.value)}
                className="accent-primary"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "送出中..." : "送出檢舉"}
          </button>
        </div>
      </div>
    </div>
  );
}
