import type { ReportReason } from "../../models/Report";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "垃圾內容" },
  { value: "HARASSMENT", label: "騷擾或霸凌" },
  { value: "OFFENSIVE_CONTENT", label: "不當內容" },
  { value: "FALSE_INFORMATION", label: "虛假資訊" },
  { value: "INAPPROPRIATE_LANGUAGE", label: "不當用語" },
  { value: "OTHER", label: "其他" },
];

export const REVIEW_SORT_OPTIONS = [
  { value: "newest", label: "最新優先" },
  { value: "likes", label: "最有幫助" },
];
