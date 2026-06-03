import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  MapPin,
  Users,
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Loader2,
  ExternalLink,
  Send,
  PenLine
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { addBookmark, removeBookmark, isBookmarked } from "../api/bookmarkApi";
import { useSchedule } from "../context/ScheduleContext";
import { getCourse, parseNTNUSchedule, type Course as APICourse } from "../api/courseApi";
import { getCourseReviews, createReview, toggleLikeReview, type Review } from "../api/reviewApi"; // NEW API IMPORTS!
import { getCourseDiscussions, createDiscussion, toggleLikeDiscussion, type Discussion } from "../api/discussionApi";

interface CourseView extends APICourse {
  professor: string;
  schedule: string;
  location: string;
  days: string[];
  timeSlot: string;
}



// ─── Helper Components ────────────────────────────────────────
function RatingIcons({ rating, type, interactive = false, setRating = () => {} }: { rating: number, type: "sweetness" | "workload", interactive?: boolean, setRating?: (r: number) => void }) {
  const Icon = type === "sweetness" ? Star : BookOpen;
  const activeClass = type === "sweetness" ? "fill-amber-400 text-amber-400" : "fill-blue-500 text-blue-500";
  const inactiveClass = "fill-slate-100 text-slate-200";

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          size={16}
          className={`${i < Math.round(rating) ? activeClass : inactiveClass} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => interactive && setRating(i + 1)}
        />
      ))}
    </span>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ course }: { course: CourseView }) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <BookOpen size={15} /> 授課教師
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.professor || "未知"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Calendar size={15} /> 上課時間
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.timeAndLocation}</p>
            <p className="text-sm text-muted-foreground pl-5 text-xs">{course.schedule}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <MapPin size={15} /> 上課地點
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.location}</p>
          </div>
          {course.capacity > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                <Users size={15} /> 課程名額
              </div>
              <p className="text-sm text-muted-foreground pl-5">{course.capacity} 人</p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 pt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>學年：{course.academicYear}</span>
          <span>學期：{course.semester === "1" ? "第一學期" : "第二學期"}</span>
          <span>開課序號：{course.serialNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Syllabus Tab ─────────────────────────────────────────────
function SyllabusTab({ course }: { course: CourseView }) {
  return (
    <div className="space-y-5">
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">官方課程大綱</h3>
          <p className="text-sm text-muted-foreground">詳細課程大綱、評分標準、指定教材等資訊請參閱師大官方選課系統。</p>
          {course.syllabusURL ? (
            <a href={course.syllabusURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
              <ExternalLink size={15} /> 前往課程大綱頁面
            </a>
          ) : (
            <p className="text-sm text-muted-foreground italic">此課程無大綱連結。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── LIVE Reviews Tab ─────────────────────────────────────────────
function ReviewsTab({ course }: { course: CourseView }) {

  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  // Form State
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const [sweetness, setSweetness] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getCourseReviews(course.courseID, sortBy);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [course.courseID, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in to post a review!");
    if (sweetness === 0 || workload === 0) return alert("Please rate both Sweetness and Workload!");
    setIsSubmitting(true);
    try {
      await createReview({
        authorID: user.id,
        courseID: course.courseID,
        content,
        sweetnessScore: sweetness,
        workloadScore: workload
      });
      setIsWriting(false);
      setContent("");
      setSweetness(0);
      setWorkload(0);
      fetchReviews(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (reviewID: string) => {
    if (!user) return alert("Please log in to like a review!");
    
    try {
      const result = await toggleLikeReview(reviewID, user.id);
      
      // Optimistically update the UI count right away without a full page reload!
      setReviews(prev => 
        prev.map(r => r.reviewID === reviewID ? { ...r, likeCount: result.likeCount } : r)
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        
        {/* NEW: Clean Dual-Metric Rating Summary */}
        <Card className="lg:col-span-1 border-slate-100 shadow-sm h-fit">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6">Rating Summary</h3>
            
            <div className="flex flex-col items-center justify-center mb-8">
              <span className="text-5xl font-extrabold text-slate-900">
                {course.averageSweetness?.toFixed(1) || "0.0"}
              </span>
              <span className="text-sm text-muted-foreground mt-1">Overall Sweetness</span>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Sweetness</span>
                <span className="text-sm font-bold text-slate-900">{course.averageSweetness?.toFixed(1) || "0.0"} / 5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Workload</span>
                <span className="text-sm font-bold text-slate-900">{course.averageWorkload?.toFixed(1) || "0.0"} / 5</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">Total Reviews</span>
                <span className="text-xs font-medium text-slate-500">{course.reviewCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Feed & Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
            <h3 className="text-base font-bold text-slate-800">Student Reviews</h3>
            <span className="text-sm text-muted-foreground">{reviews.length} total</span>
            
            {/* 💡 NEW: Sort Selection Dropdown */}
            <div className="mt-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-slate-200 p-1.5 text-xs bg-white font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="likes">Most Helpful (Likes)</option>
              </select>
            </div>
          </div>
            <Button 
              onClick={() => {
                if (!isWriting) {
                  setContent(""); setSweetness(0); setWorkload(0);
                }
                setIsWriting(!isWriting);
              }}
              className="gap-2" size="sm"
            >
              <PenLine size={15} /> {isWriting ? "Cancel" : "Write a Review"}
            </Button>
          </div>

          {/* Write a Review Form */}
          {isWriting && (
            <Card className="border-primary/20 shadow-md bg-slate-50/50 mb-6">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-8 py-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Sweetness</label>
                      <RatingIcons rating={sweetness} type="sweetness" interactive={true} setRating={setSweetness} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Workload</label>
                      <RatingIcons rating={workload} type="workload" interactive={true} setRating={setWorkload} />
                    </div>
                  </div>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="What did you think of this specific course?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    Post Review
                  </button>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-card p-8 text-center text-muted-foreground text-sm">
              No reviews yet. Be the first to write one!
            </div>
          ) : (
            reviews.map((review) => {
              const date = new Date(review.timestamp).toLocaleDateString();
              return (
                <Card key={review.reviewID} className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-semibold text-slate-600 mt-1">
                        {review.authorID} • {date}
                      </p>
                      <div className="flex flex-col gap-1.5 items-end shrink-0 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sweet</span>
                          <RatingIcons rating={review.sweetnessScore} type="sweetness" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work</span>
                          <RatingIcons rating={review.workloadScore} type="workload" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
                      {review.content}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                        {review.sweetnessScore >= 4 && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5 border border-emerald-100">
                            <CheckCircle2 size={12} /> Would Recommend
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleToggleLike(review.reviewID)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <ThumbsUp size={14} /> {review.likeCount} Helpful
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Discussions Tab ──────────────────────────────────────────
function DiscussionsTab({ courseID }: { courseID: string }) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const data = await getCourseDiscussions(courseID);
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [courseID]);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in first!");
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createDiscussion({ authorID: user.id, courseID, title, content });
      setTitle("");
      setContent("");
      setIsWriting(false);
      fetchDiscussions();
    } catch (err) {
      alert("Failed to post discussion thread.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, discussionID: string) => {
    e.preventDefault(); // Prevents the Link from routing when clicking the like button
    if (!user) return alert("Please log in to like!");
    try {
      const res = await toggleLikeDiscussion(discussionID, user.id);
      setDiscussions(prev => prev.map(d => d.discussionID === discussionID ? { ...d, likeCount: res.likeCount } : d));
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-800">Course Board</h3>
          <span className="text-sm text-muted-foreground">{discussions.length} total threads</span>
        </div>
        <Button onClick={() => setIsWriting(!isWriting)} variant={isWriting ? "ghost" : "default"}>
          {isWriting ? "Cancel" : "New Discussion"}
        </Button>
      </div>

      {isWriting && (
        <Card className="border-primary/20 shadow-md bg-slate-50/50">
          <CardContent className="p-6">
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Start a Conversation</h3>
              <Input placeholder="Discussion Title" value={title} onChange={e => setTitle(e.target.value)} required />
              <textarea 
                className="w-full min-h-[120px] rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                placeholder="What would you like to ask or discuss about this course?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Thread"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-sm text-slate-500 py-8">Loading discussions...</p>
        ) : discussions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
            No discussions for this course yet. Be the first!
          </div>
        ) : (
          discussions.map(disc => (
            <Link key={disc.discussionID} to={`/courses/${courseID}/discussions/${disc.discussionID}`} className="block">
              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg hover:text-primary transition-colors">{disc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Posted by {disc.authorID} • {new Date(disc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {disc.content}
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-slate-500 border-t border-slate-100 mt-2">
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
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function CourseDetail() {
  const { courseID } = useParams<{ courseID: string }>();
  const { user } = useAuth();
  const { addToSchedule, isScheduled } = useSchedule();

  const [course, setCourse] = useState<CourseView | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);


  useEffect(() => {
    if (!courseID) return;
    setLoadingCourse(true);
    setNotFound(false);

    getCourse(courseID)
      .then((data) => {
        const parsed = parseNTNUSchedule(data.timeAndLocation);
        setCourse({
          ...data,
          professor: data.professors.join("、"),
          schedule: parsed.schedule,
          location: parsed.location,
          days: parsed.days,
          timeSlot: parsed.timeSlot,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingCourse(false));
  }, [courseID]);

  useEffect(() => {
    if (!user || !courseID) return;
    isBookmarked(user.id, courseID)
      .then((res) => setIsSaved(res.isBookmarked))
      .catch(() => {});
  }, [user, courseID]);

  const handleBookmark = async () => {
    if (!user) return alert("請先登入");
    setLoadingSave(true);
    try {
      if (isSaved) {
        await removeBookmark(user.id, courseID!);
        setIsSaved(false);
      } else {
        await addBookmark(user.id, { courseId: courseID! });
        setIsSaved(true);
      }
    } catch {
      alert("操作失敗，請稍後再試");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingCourse) {
    return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  if (notFound || !course) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-xl font-semibold text-slate-700">找不到這門課程。</p>
        <Link to="/courses" className="text-primary hover:underline text-sm">← 回到課程目錄</Link>
      </div>
    );
  }

  // --- NEW: Split the title! ---
  const titleParts = (course.title || "").split(/<\/?br\s*\/?>/i);
  const mainTitle = titleParts[0];
  const subTitle = titleParts[1] ? titleParts[1].trim() : "";

  return (
    <div className="space-y-6 pb-12">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> 回到課程目錄
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {/* Use the cleaned up title here */}
          <h1 className="text-3xl font-extrabold text-slate-900">{course.courseID} {mainTitle ? `— ${mainTitle}` : ""}</h1>
          {subTitle && <p className="mt-1 text-lg text-muted-foreground">{subTitle}</p>}
          
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{course.department}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button disabled={loadingSave} onClick={handleBookmark} className={`rounded-full p-1.5 transition-colors ${isSaved ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-rose-400"}`}>
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <Button className={`font-semibold transition-colors ${isScheduled(course.courseID) ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`} onClick={() => { addToSchedule({ courseID: course.courseID, serialNumber: course.courseID, title: course.title, department: course.department, credits: course.credits, professor: course.professor, schedule: course.schedule, location: course.location, days: course.days, timeSlot: course.timeSlot, }); }}>
            {isScheduled(course.courseID) ? "✓ 已加入課表" : "加入課表"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="overview" className="flex-1 rounded-lg">課程資訊</TabsTrigger>
          <TabsTrigger value="syllabus" className="flex-1 rounded-lg">課程大綱</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-lg">評論</TabsTrigger>
          <TabsTrigger value="discussions" className="flex-1 rounded-lg">討論</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5"><OverviewTab course={course} /></TabsContent>
        <TabsContent value="syllabus" className="mt-5"><SyllabusTab course={course} /></TabsContent>
        <TabsContent value="reviews" className="mt-5"><ReviewsTab course={course} /></TabsContent>
        <TabsContent value="discussions" className="mt-5"><DiscussionsTab courseID={course.courseID} /></TabsContent>
      </Tabs>
    </div>
  );
}