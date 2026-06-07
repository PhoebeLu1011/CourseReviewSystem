import { useCallback, useEffect, useState } from "react";
import type React from "react";
import { Link } from "react-router";
import { MessageSquare, ThumbsUp } from "lucide-react";

import {
  createDiscussion,
  getCourseDiscussions,
  toggleLikeDiscussion,
  type Discussion,
} from "../../api/discussionApi";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function DiscussionsTab({ courseID }: { courseID: string }) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      setDiscussions(await getCourseDiscussions(courseID));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseID]);

  useEffect(() => {
    void fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreateDiscussion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return alert("請先登入才能發起討論！");
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createDiscussion({ courseID, title, content });
      setTitle("");
      setContent("");
      setIsWriting(false);
      await fetchDiscussions();
    } catch {
      alert("發佈討論失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (event: React.MouseEvent, discussionID: string) => {
    event.preventDefault();
    if (!user) return alert("請先登入才能按讚！");

    try {
      const result = await toggleLikeDiscussion(discussionID);
      setDiscussions((current) =>
        current.map((discussion) =>
          discussion.discussionID === discussionID
            ? { ...discussion, likeCount: result.likeCount }
            : discussion
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <DiscussionsHeader
        count={discussions.length}
        isWriting={isWriting}
        onToggleWriting={() => setIsWriting((current) => !current)}
      />

      {isWriting && (
        <DiscussionForm
          title={title}
          content={content}
          isSubmitting={isSubmitting}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onSubmit={handleCreateDiscussion}
        />
      )}

      <DiscussionList
        loading={loading}
        courseID={courseID}
        discussions={discussions}
        onLike={handleLike}
      />
    </div>
  );
}

function DiscussionsHeader({
  count,
  isWriting,
  onToggleWriting,
}: {
  count: number;
  isWriting: boolean;
  onToggleWriting: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-800">課程討論區</h3>
        <span className="text-sm text-muted-foreground">共 {count} 則討論</span>
      </div>

      <Button onClick={onToggleWriting} variant={isWriting ? "ghost" : "default"}>
        {isWriting ? "取消" : "新增討論"}
      </Button>
    </div>
  );
}

function DiscussionForm({
  title,
  content,
  isSubmitting,
  onTitleChange,
  onContentChange,
  onSubmit,
}: {
  title: string;
  content: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Card className="border-primary/20 bg-slate-50/50 shadow-md">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">發起討論</h3>

          <input
            className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="討論標題"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            required
          />

          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="想問什麼或討論什麼？"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            required
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "發佈中..." : "送出討論"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DiscussionList({
  loading,
  courseID,
  discussions,
  onLike,
}: {
  loading: boolean;
  courseID: string;
  discussions: Discussion[];
  onLike: (event: React.MouseEvent, discussionID: string) => void;
}) {
  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">討論載入中...</p>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
        目前還沒有討論，來開始第一則吧！
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <Link
          key={discussion.discussionID}
          to={`/courses/${courseID}/discussions/${discussion.discussionID}`}
          className="block"
        >
          <Card className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 transition-colors hover:text-primary">
                  {discussion.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  User {discussion.authorID.substring(0, 8)}... •{" "}
                  {new Date(discussion.timestamp).toLocaleDateString()}
                </p>
              </div>

              <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                {discussion.content}
              </p>

              <div className="mt-2 flex items-center gap-4 border-t border-slate-100 pt-2 text-slate-500">
                <button
                  onClick={(event) => onLike(event, discussion.discussionID)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-rose-600"
                >
                  <ThumbsUp size={14} /> {discussion.likeCount} 讚
                </button>

                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <MessageSquare size={14} /> {discussion.replyCount} 則回覆
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
