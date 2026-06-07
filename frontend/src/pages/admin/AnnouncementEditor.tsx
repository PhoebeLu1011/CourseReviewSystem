import { useEffect, useState, type FormEvent } from "react";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from "../../api/announcementApi";
import { AnnouncementEditorHeader } from "../../components/admin/announcements/AnnouncementEditorHeader";
import { AnnouncementFormPanel } from "../../components/admin/announcements/AnnouncementFormPanel";
import { AnnouncementList } from "../../components/admin/announcements/AnnouncementList";
import { AnnouncementPreview } from "../../components/admin/announcements/AnnouncementPreview";
import {
  audienceToTarget,
  type AnnouncementEditorView,
  type Audience,
  type Category,
} from "../../components/admin/announcements/announcementEditorTypes";
import { useAuth } from "../../context/AuthContext";
import type { Announcement } from "../../models/Announcement";

export function AnnouncementEditor() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [audience, setAudience] = useState<Audience>("All Students");
  const [isPinned, setIsPinned] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<AnnouncementEditorView>("form");

  const fetchAnnouncements = async () => {
    try {
      setAnnouncements(await getAllAnnouncements());
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    void fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("General");
    setAudience("All Students");
    setIsPinned(false);
    setScheduleDate("");
    setScheduleTime("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledAt =
        scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}:00` : undefined;

      await createAnnouncement({
        title,
        content,
        tags: [category],
        target: audienceToTarget(audience),
        is_pinned: isPinned,
        scheduled_at: scheduledAt,
        created_by: user?.id,
      });

      alert("公告發布成功！");
      resetForm();
      await fetchAnnouncements();
      setView("list");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? `發布失敗：${err.message}` : "網路錯誤，請確認後端是否正常運行");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這則公告嗎？")) return;

    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch {
      alert("網路錯誤");
    }
  };

  const handleViewChange = (nextView: AnnouncementEditorView) => {
    setView(nextView);
    if (nextView === "list") {
      void fetchAnnouncements();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white">
      <AnnouncementEditorHeader
        view={view}
        announcementCount={announcements.length}
        onViewChange={handleViewChange}
      />

      {view === "form" ? (
        <div className="flex min-h-[700px] flex-1 flex-col overflow-hidden lg:flex-row">
          <AnnouncementFormPanel
            title={title}
            content={content}
            category={category}
            audience={audience}
            isPinned={isPinned}
            scheduleDate={scheduleDate}
            scheduleTime={scheduleTime}
            isSubmitting={isSubmitting}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onCategoryChange={setCategory}
            onAudienceChange={setAudience}
            onPinnedChange={setIsPinned}
            onScheduleDateChange={setScheduleDate}
            onScheduleTimeChange={setScheduleTime}
            onSubmit={handleSubmit}
          />
          <AnnouncementPreview
            title={title}
            content={content}
            category={category}
            audience={audience}
            isPinned={isPinned}
            scheduleDate={scheduleDate}
          />
        </div>
      ) : (
        <AnnouncementList
          announcements={announcements}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
