import { useCallback, useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { getDiscussionByID, getDiscussionReplies, createReply, toggleLikeDiscussion, toggleLikeReply, type Discussion, type Reply } from "../api/discussionApi";
import { formatCourseDisplayCode } from "../utils/courseDisplay";

export default function DiscussionDetail() {
  const { discussionID } = useParams<{ discussionID: string }>();
  const { user } = useAuth();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadThreadData = useCallback(async () => {
    if (!discussionID) return;
    try {
      const [discData, repliesData] = await Promise.all([
        getDiscussionByID(discussionID),
        getDiscussionReplies(discussionID)
      ]);
      setDiscussion(discData);
      setReplies(repliesData);
    } catch (err) {
      console.error("Error loading discussion details thread:", err);
    } finally {
      setLoading(false);
    }
  }, [discussionID]);

  useEffect(() => {
    loadThreadData();
  }, [loadThreadData]);

  const handleLikeDiscussion = async () => {
    if (!user || !discussion) return alert("Please log in to like this post!");
    try {
      const res = await toggleLikeDiscussion(discussion.discussionID);
      setDiscussion(prev => prev ? {
        ...prev,
        likeCount: res.likeCount,
        likedBy: prev.likedBy?.includes(user.id)
          ? prev.likedBy.filter(id => id !== user.id)
          : [...(prev.likedBy || []), user.id]
      } : null);
    } catch (error) {
      console.error("Failed to like discussion:", error);
    }
  };

  const handleLikeReply = async (replyID: string) => {
    if (!user) return alert("Please log in to like this reply!");
    try {
      const res = await toggleLikeReply(replyID);
      setReplies(prev => prev.map(r => r.replyID === replyID ? {
        ...r,
        likeCount: res.likeCount,
        likedBy: r.likedBy?.includes(user.id)
          ? r.likedBy.filter(id => id !== user.id)
          : [...(r.likedBy || []), user.id]
      } : r));
    } catch (error) {
      console.error("Failed to like reply:", error);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !discussionID || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await createReply(discussionID, {
        content: replyText
      });
      setReplyText("");
      // Refresh comment list and increment parent render
      const updatedReplies = await getDiscussionReplies(discussionID);
      setReplies(updatedReplies);
      setDiscussion(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
    } catch {
      alert("Failed to post comment reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="p-8 text-center text-slate-500">
        Thread post could not be located or has been archived.
        <div className="mt-4"><Link to="/discussions" className="text-primary hover:underline">Return to Hub</Link></div>
      </div>
    );
  }

  const isPostLikedByMe = user && discussion.likedBy?.includes(user.id);
  const courseDisplayCode = formatCourseDisplayCode(discussion.courseID);

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/discussions"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> 返回所有討論
        </Link>
        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border">
          {courseDisplayCode}
        </span>
      </div>

      {/* Main Discussion Opener Card */}
      <Card className="border-slate-100 shadow-sm bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none">
              {discussion.authorID.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{discussion.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {discussion.authorID} • {new Date(discussion.timestamp).toLocaleDateString("zh-TW")}
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 border rounded-xl p-4 whitespace-pre-wrap">
            {discussion.content}
          </div>

          <div className="flex items-center gap-4 pt-2 text-slate-500 border-t">
            <button
              onClick={handleLikeDiscussion}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors py-1 px-2 rounded-md ${
                isPostLikedByMe ? "text-rose-600 bg-rose-50 font-semibold" : "hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <ThumbsUp size={14} className={isPostLikedByMe ? "fill-rose-500" : ""} />
              {discussion.likeCount} 有幫助
            </button>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <MessageSquare size={14} /> {discussion.replyCount} 則回覆
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comments Header Title */}
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-4">
        <MessageSquare size={18} className="text-slate-400" /> 回覆（{replies.length}）
      </h2>

      {/* Comment Responses Feed Stream */}
      <div className="space-y-3">
        {replies.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-xl text-slate-400 bg-white text-sm">
            還沒有回覆，來第一個分享你的想法吧！
          </div>
        ) : (
          replies.map(reply => {
            const isReplyLikedByMe = user && reply.likedBy?.includes(user.id);
            return (
              <Card key={reply.replyID} className="border-slate-100 shadow-none bg-white">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase select-none">
                        {reply.authorID.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{reply.authorID}</span>
                      <span className="text-[10px] text-slate-400">• {new Date(reply.timestamp).toLocaleDateString("zh-TW")}</span>
                    </div>

                    <button
                      onClick={() => handleLikeReply(reply.replyID)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-50 transition-colors ${
                        isReplyLikedByMe ? "text-rose-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      <ThumbsUp size={12} className={isReplyLikedByMe ? "fill-rose-500" : ""} /> {reply.likeCount}
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 pl-8 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Write a Reply Form Block */}
      {user ? (
        <form onSubmit={handlePostReply} className="flex gap-3 bg-white p-4 border rounded-xl shadow-sm items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">撰寫回覆</label>
            <textarea
              className="w-full min-h-[70px] max-h-[150px] p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-y"
              placeholder="分享你的想法、解答或建議..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !replyText.trim()} className="h-10 shrink-0 px-4">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-slate-50 border border-dashed rounded-xl text-center text-sm text-slate-500">
          Please <Link to="/auth/login" className="text-primary font-bold hover:underline">Log In</Link> to contribute to this discussion thread board.
        </div>
      )}
    </div>
  );
}
