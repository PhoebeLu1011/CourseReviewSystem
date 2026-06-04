import { useState, useEffect } from "react";
import {
  Pin,
  Send,
  Calendar,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2
} from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";
import { API_BASE_URL } from "../../config/api";

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

export function AnnouncementEditor() {
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
      if (!res.ok) throw new Error("Failed to fetch");
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
      const scheduledAt = scheduleDate && scheduleTime
        ? `${scheduleDate}T${scheduleTime}:00`
        : undefined;

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
          created_by: "admin_001", // TODO: 改成從 auth context 取得的管理員 ID
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
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">

      {/* Tab 切換：Form / List */}
      <div className="flex items-center justify-between px-8 pt-6 pb-0 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Announcement</h2>
          <p className="text-sm text-slate-500 mt-1">Compose and schedule messages to the student body</p>
        </div>
        <div className="flex gap-2 mb-0">
          <button
            onClick={() => setView("form")}
            className={clsx(
              "px-4 py-2 rounded-t-lg text-sm font-medium border-b-2 transition-all",
              view === "form" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            ＋ 新增公告
          </button>
          <button
            onClick={() => { setView("list"); fetchAnnouncements(); }}
            className={clsx(
              "px-4 py-2 rounded-t-lg text-sm font-medium border-b-2 transition-all",
              view === "list" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            所有公告 ({announcements.length})
          </button>
        </div>
      </div>

      {view === "form" ? (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[700px]">
          {/* Form */}
          <div className="flex-1 border-r border-slate-100 p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., System Maintenance This Weekend"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-800 shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Category Tag</label>
                  <div className="flex gap-2">
                    {(["System", "Emergency", "General"] as Category[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(
                          "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border shadow-sm",
                          category === cat
                            ? (cat === "System" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                               cat === "Emergency" ? "bg-rose-50 border-rose-200 text-rose-700" :
                               "bg-emerald-50 border-emerald-200 text-emerald-700")
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Audience)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium text-slate-700 shadow-sm bg-white"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Undergraduates">Undergraduates Only</option>
                    <option value="Graduates">Graduates Only</option>
                    <option value="Faculty">Faculty & Staff</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Message Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the announcement details here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm text-slate-800 shadow-sm resize-none"
                  required
                />
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-5">
                {/* Pin Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Pin to Top</p>
                    <p className="text-xs text-slate-500 mt-0.5">Keep this announcement at the top of the feed</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={clsx(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                      isPinned ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <span className={clsx(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      isPinned ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Scheduled Posting */}
                <div className="border-t border-indigo-100/60 pt-4">
                  <p className="text-sm font-bold text-slate-800 mb-3">Scheduled Posting (Optional)</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-700 bg-white"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Clock size={16} />
                      </div>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-700 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors focus:ring-4 focus:ring-indigo-100"
                >
                  <Send size={18} />
                  {isSubmitting ? "發布中..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview */}
          <div className="w-full lg:w-[400px] bg-slate-100 p-6 lg:p-8 flex flex-col items-center justify-center border-l border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 font-medium mb-6 uppercase tracking-wider text-xs">
              <Smartphone size={16} /> Live Mobile Preview
            </div>
            <div className="w-[320px] h-[640px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-800 relative overflow-hidden flex flex-col">
              <div className="h-7 w-full flex justify-between items-center px-5 pt-1 text-[10px] font-bold text-slate-800 bg-white z-10 shrink-0">
                <span>9:41</span>
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-full z-20"></div>
              <div className="bg-indigo-600 text-white px-5 pt-6 pb-4 shadow-sm shrink-0 mt-3">
                <h1 className="font-bold text-lg">NTNU Announcements</h1>
              </div>
              <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
                <div className={clsx(
                  "bg-white rounded-xl p-4 shadow-sm border",
                  category === "Emergency" ? "border-rose-200" : "border-slate-100"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={clsx(
                      "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      category === "System" ? "bg-indigo-100 text-indigo-700" :
                      category === "Emergency" ? "bg-rose-100 text-rose-700" :
                      "bg-emerald-100 text-emerald-700"
                    )}>
                      {category === "System" && <Info size={10} />}
                      {category === "Emergency" && <AlertCircle size={10} />}
                      {category === "General" && <CheckCircle2 size={10} />}
                      {category}
                    </span>
                    {isPinned && <Pin size={14} className="text-amber-500 fill-amber-500 shrink-0 transform rotate-45" />}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">
                    {title || "Untitled Announcement"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {content || "Preview your message content here as you type..."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{audience}</span>
                    <span>{scheduleDate ? format(new Date(scheduleDate + "T00:00:00"), "MMM d, yyyy") : "Just now"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Announcement List */
        <div className="p-6 space-y-4 overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="text-center py-16 text-slate-400">目前沒有任何公告</div>
          ) : (
            announcements.map((a) => (
              <div key={a.announcementID} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_pinned && (
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 置頂</span>
                      )}
                      {(a.tags || []).map(tag => (
                        <span key={tag} className={clsx(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          tag === "System" ? "bg-indigo-100 text-indigo-700" :
                          tag === "Emergency" ? "bg-rose-100 text-rose-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{a.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {a.created_at ? new Date(a.created_at).toLocaleString("zh-TW") : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.announcementID)}
                    className="ml-4 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
