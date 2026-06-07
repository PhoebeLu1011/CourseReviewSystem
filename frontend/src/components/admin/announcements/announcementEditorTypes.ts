export type Category = "System" | "Emergency" | "General";
export type Audience = "All Students" | "Undergraduates" | "Graduates" | "Faculty";
export type AnnouncementEditorView = "form" | "list";

export function formatPreviewDate(date: string) {
  if (!date) return "Just now";
  return new Date(`${date}T00:00:00`).toLocaleDateString("zh-TW");
}

export function audienceToTarget(audience: Audience) {
  return audience === "All Students" ? "all" : audience.toLowerCase();
}
