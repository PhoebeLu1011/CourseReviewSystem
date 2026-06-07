import { useEffect, useState } from "react";
import {
  Pin,
  Send,
  Calendar,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

type Category = "System" | "Emergency" | "General";
type Audience = "All Students" | "Undergraduates" | "Graduates" | "Faculty";

interface Announcement {
  announcementID: string;
  title: string;
  content: string;
  tags?: string[];
  target: string;
  is_pinned: boolean;
  created_at: string;
}

function formatPreviewDate(date: string) {
  if (!date) return "Just now";
  return new Date(`${date}T00:00:00`).toLocaleDateString("zh-TW");
}

export function AnnouncementEditor() {
  const {user} = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [audience, setAudience] = useState<Audience>("All Students");
  const [isPinned, setIsPinned] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<"form" | "list">("form");

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcements`);

      if (!res.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const scheduledAt =
        scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}:00` : undefined;

      const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: [category],
          target: audience === "All Students" ? "all" : audience.toLowerCase(),
          is_pinned: isPinned,
          scheduled_at: scheduledAt,
          created_by: user?.id ?? null,
        }),
      });

      if (res.ok) {
        alert("公告發布成功！");
        setTitle("");
        setContent("");
        setCategory("General");
        setAudience("All Students");
        setIsPinned(false);
        setScheduleDate("");
        setScheduleTime("");
        await fetchAnnouncements();
        setView("list");
      } else {
        const err = await res.json();
        alert(`發布失敗：${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("網路錯誤，請確認後端是否正常運行");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這則公告嗎？")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAnnouncements();
      } else {
        alert("刪除失敗");
      }
    } catch {
      alert("網路錯誤");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-8 pb-0 pt-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Create Announcement
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Compose and schedule messages to the student body
          </p>
        </div>

        <div className="mb-0 flex gap-2">
          <button
            type="button"
            onClick={() => setView("form")}
            className={clsx(
              "rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-all",
              view === "form"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            ＋ 新增公告
          </button>

          <button
            type="button"
            onClick={() => {
              setView("list");
              fetchAnnouncements();
            }}
            className={clsx(
              "rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-all",
              view === "list"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            所有公告 ({announcements.length})
          </button>
        </div>
      </div>

      {view === "form" ? (
        <div className="flex min-h-[700px] flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex-1 overflow-y-auto border-r border-slate-100 bg-slate-50/30 p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., System Maintenance This Weekend"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Category Tag
                  </label>

                  <div className="flex gap-2">
                    {(["System", "Emergency", "General"] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-all",
                          category === cat
                            ? cat === "System"
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : cat === "Emergency"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Target Audience
                  </label>

                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Audience)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Undergraduates">Undergraduates Only</option>
                    <option value="Graduates">Graduates Only</option>
                    <option value="Faculty">Faculty & Staff</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the announcement details here..."
                  rows={6}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Pin to Top</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Keep this announcement at the top of the feed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPinned((prev) => !prev)}
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
                    Scheduled Posting (Optional)
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Calendar size={16} />
                      </div>

                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Clock size={16} />
                      </div>

                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-400"
                >
                  <Send size={18} />
                  {isSubmitting ? "發布中..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>

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
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto p-6">
          {announcements.length === 0 ? (
            <div className="py-16 text-center text-slate-400">目前沒有任何公告</div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.announcementID}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {announcement.is_pinned && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          📌 置頂
                        </span>
                      )}

                      {(announcement.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className={clsx(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            tag === "System"
                              ? "bg-indigo-100 text-indigo-700"
                              : tag === "Emergency"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800">
                      {announcement.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {announcement.content}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {announcement.created_at
                        ? new Date(announcement.created_at).toLocaleString("zh-TW")
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(announcement.announcementID)}
                    className="ml-4 rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="刪除公告"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
