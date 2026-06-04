import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, Loader2, BookOpen, Search } from "lucide-react";
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
  const [selectedCourse, setSelectedCourse] = useState("All Courses");

  // Form States
  const [isWriting, setIsWriting] = useState(false);
  const [newCourseID, setNewCourseID] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const query = selectedCourse === "All Courses" ? "" : selectedCourse;
      const data = await getAllDiscussions(query);
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in first!");
    if (!title.trim() || !content.trim() || !newCourseID.trim()) return;

    setIsSubmitting(true);
    try {
      await createDiscussion({
        authorID: user.id,
        courseID: newCourseID,
        title,
        content
      });
      setTitle("");
      setContent("");
      setNewCourseID("");
      setIsWriting(false);
      fetchDiscussions();
    } catch (err) {
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, discussionID: string) => {
    e.preventDefault(); // Prevents card link navigation click capture
    if (!user) return alert("Please log in to like!");
    try {
      const res = await toggleLikeDiscussion(discussionID, user.id);
      setDiscussions(prev => prev.map(d => d.discussionID === discussionID ? { ...d, likeCount: res.likeCount } : d));
    } catch (err) {}
  };

  return (
    <div className="pb-12 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Discussion Hub</h1>
          <p className="text-muted-foreground mt-1">Ask questions, share advice, and connect with peers</p>
        </div>
        <Button onClick={() => setIsWriting(!isWriting)}>
          {isWriting ? "Cancel" : "New Discussion"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg">Filters</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Course ID</label>
                <Input 
                  placeholder="e.g., 5003 (or 'All Courses')" 
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
                  <h3 className="font-bold text-lg text-slate-900">Post a New Thread</h3>
                  <Input placeholder="Course ID (e.g., 5003)" value={newCourseID} onChange={e => setNewCourseID(e.target.value)} required />
                  <Input placeholder="Discussion Title" value={title} onChange={e => setTitle(e.target.value)} required />
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    placeholder="Describe your question or discussion point in detail..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                    Post Thread
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
              No discussions found here yet. Start the conversation!
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
                        Posted by {disc.authorID} • {new Date(disc.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {disc.content}
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-slate-500">
                    <button onClick={(e) => handleLike(e, disc.discussionID)} className="flex items-center gap-1.5 text-xs font-medium hover:text-rose-600 transition-colors">
                      <ThumbsUp size={14} /> {disc.likeCount} Likes
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <MessageSquare size={14} /> {disc.replyCount} Replies
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