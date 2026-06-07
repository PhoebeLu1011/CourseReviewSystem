import { useCallback, useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Link } from "react-router";
import { getAllDiscussions, createDiscussion, toggleLikeDiscussion, type Discussion } from "../api/discussionApi";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

export default function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Form States
  const [isWriting, setIsWriting] = useState(false);
  const [newCourseID, setNewCourseID] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const query = selectedCourse;
      const data = await getAllDiscussions(query);
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("請先登入！");
    if (!title.trim() || !content.trim() || !newCourseID.trim()) return;

    setIsSubmitting(true);
    try {
      await createDiscussion({
        courseID: newCourseID,
        title,
        content
      });
      setTitle("");
      setContent("");
      setNewCourseID("");
      setIsWriting(false);
      fetchDiscussions();
    } catch {
      alert("發文失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, discussionID: string) => {
    e.preventDefault(); // Prevents card link navigation click capture
    if (!user) return alert("請先登入！");
    try {
      const res = await toggleLikeDiscussion(discussionID);
      setDiscussions(prev => prev.map(d => d.discussionID === discussionID ? { ...d, likeCount: res.likeCount } : d));
    } catch (error) {
      console.error("Failed to like discussion:", error);
    }
  };

  return (
    <div className="pb-12 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">討論區</h1>
          <p className="text-muted-foreground mt-1">提問、分享心得，與同學交流</p>
        </div>
        <Button onClick={() => setIsWriting(!isWriting)}>
          {isWriting ? "取消" : "發起討論"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg">篩選</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">課程 ID</label>
                <Input
                  placeholder="輸入課程 ID 搜尋"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discussions Stream */}
        <div className="lg:col-span-3 space-y-5">
          {isWriting && (
            <Card className="border-primary/20 shadow-md bg-slate-50/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-900">發起新討論</h3>
                  <Input placeholder="課程 ID（例：5003）" value={newCourseID} onChange={e => setNewCourseID(e.target.value)} required />
                  <Input placeholder="討論標題" value={title} onChange={e => setTitle(e.target.value)} required />
                  <textarea
                    className="w-full min-h-[120px] rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    placeholder="詳細描述你的問題或想討論的內容..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                    送出
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          )}

          {!loading && discussions.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-slate-500">
              目前沒有討論，來發起第一篇吧！
            </div>
          )}

          {!loading && discussions.map((disc) => (
            <Link key={disc.discussionID} to={`/courses/${disc.courseID}/discussions/${disc.discussionID}`} className="block">
              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border">
                        {disc.courseID}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 mt-2 hover:text-primary transition-colors">
                        {disc.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {disc.authorID} • {new Date(disc.timestamp).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {disc.content}
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-slate-500">
                    <button onClick={(e) => handleLike(e, disc.discussionID)} className="flex items-center gap-1.5 text-xs font-medium hover:text-rose-600 transition-colors">
                      <ThumbsUp size={14} /> {disc.likeCount} 有幫助
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <MessageSquare size={14} /> {disc.replyCount} 則回覆
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
