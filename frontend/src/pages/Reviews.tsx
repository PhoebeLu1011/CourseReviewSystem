import { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle2, Lock, Loader2, Send, BookOpen, Flag, X, ChevronDown } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Link } from "react-router";
import { getAllReviews, createReview, toggleLikeReview, type Review } from "../api/reviewApi";
import { getDepartments } from "../api/courseApi";
import { submitReport } from "../api/reportApi";
import type { ReportReason } from "../models/Report";
import { useAuth } from "../context/AuthContext";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "垃圾內容" },
  { value: "HARASSMENT", label: "騷擾或霸凌" },
  { value: "OFFENSIVE_CONTENT", label: "不當內容" },
  { value: "FALSE_INFORMATION", label: "虛假資訊" },
  { value: "INAPPROPRIATE_LANGUAGE", label: "不當用語" },
  { value: "OTHER", label: "其他" },
];

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

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 💡 NEW: Filter States
  const [selectedCourse, setSelectedCourse] = useState(""); 
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [departments, setDepartments] = useState<string[]>([]);

  // Form State
  const [isWriting, setIsWriting] = useState(false);
  const [newReviewCourse, setNewReviewCourse] = useState(""); 
  const [content, setContent] = useState("");
  const [sweetness, setSweetness] = useState(0); 
  const [workload, setWorkload] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report State
  const [reportingReviewID, setReportingReviewID] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("SPAM");
  const [isReporting, setIsReporting] = useState(false);

  // Fetch Departments on Mount
  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleReport = async () => {
    if (!user || !reportingReviewID) return;
    setIsReporting(true);
    try {
      await submitReport({ reporterID: user.id, reviewID: reportingReviewID, reason: reportReason });
      alert("檢舉已送出，謝謝您的回報。");
      setReportingReviewID(null);
    } catch (err: any) {
      alert(err.message === "Already reported this review" ? "你已經檢舉過這則評論了。" : "檢舉失敗，請稍後再試。");
    } finally {
      setIsReporting(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews(selectedCourse, sortBy, selectedDepartment); 
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when any filter changes
  useEffect(() => {
    fetchReviews();
  }, [selectedCourse, sortBy, selectedDepartment]);

  const handleToggleLike = async (reviewID: string) => {
    if (!user) return alert("Please log in to like a review!");
    try {
      const result = await toggleLikeReview(reviewID, user.id);
      setReviews(prev => 
        prev.map(r => r.reviewID === reviewID ? { 
          ...r, 
          likeCount: result.likeCount,
          likedBy: r.likedBy?.includes(user.id) ? r.likedBy.filter(id => id !== user.id) : [...(r.likedBy || []), user.id]
        } : r)
      );
    } catch (error: any) { alert(error.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !newReviewCourse.trim()) return;
    if (sweetness === 0 || workload === 0) return alert("Please provide a rating for both Sweetness and Workload.");
    
    setIsSubmitting(true);
    try {
      await createReview({
        authorID: user?.id || "student_123",
        courseID: newReviewCourse,
        content: content,
        sweetnessScore: sweetness,
        workloadScore: workload
      });
      setContent("");
      setIsWriting(false);
      fetchReviews();
    } catch (error: any) {
      alert(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12 space-y-6">
      {/* 檢舉 Modal */}
      {reportingReviewID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">檢舉評論</h3>
              <button onClick={() => setReportingReviewID(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted-foreground">請選擇檢舉原因：</p>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                  <input type="radio" name="reportReason" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} className="accent-primary" />
                  <span className="text-sm text-slate-700">{r.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setReportingReviewID(null)} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
              <button onClick={handleReport} disabled={isReporting} className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600 transition-colors disabled:opacity-50">
                {isReporting ? "送出中..." : "送出檢舉"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">課程評價</h1>
          <p className="text-muted-foreground mt-1">查看所有學生的課程評論與評分</p>
        </div>
        <button
          onClick={() => {
            if (!isWriting) { setNewReviewCourse(""); setContent(""); setSweetness(0); setWorkload(0); }
            setIsWriting(!isWriting);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {isWriting ? "取消" : "撰寫評論"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg">篩選</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">搜尋課程</label>
                <Input
                  className="bg-slate-50/50"
                  placeholder="輸入課程 ID 或名稱"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                />
              </div>

              {/* 💡 NEW: Department Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">開課系所</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">所有系所</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 💡 NEW: Sort Dropdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-700">排序方式</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">最新優先</option>
                    <option value="likes">最有幫助 (Likes)</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reviews Feed */}
        <div className="lg:col-span-3 space-y-5">
          {/* Write a Review Form */}
          {isWriting && (
            <Card className="border-primary/20 shadow-md bg-slate-50/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">撰寫評論</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">課程 ID</label>
                      <Input value={newReviewCourse} onChange={(e) => setNewReviewCourse(e.target.value)} placeholder="例：5002" required />
                    </div>
                  </div>
                  <div className="flex gap-8 py-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">甜度</label>
                      <RatingIcons rating={sweetness} type="sweetness" interactive={true} setRating={setSweetness} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">涼度</label>
                      <RatingIcons rating={workload} type="workload" interactive={true} setRating={setWorkload} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">評論內容</label>
                    <textarea className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="分享你對這門課的想法、教授教學方式、作業難度等..." value={content} onChange={(e) => setContent(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 送出評論
                  </button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Login Banner */}
          {!user && !isWriting && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock size={16} className="text-slate-400" />
                <span>請先登入才能撰寫評論或檢舉內容。</span>
                <Link to="/auth/login" className="font-semibold text-primary hover:underline">前往登入</Link>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{reviews.length} 則評論</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {/* Empty State */}
          {!loading && reviews.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-slate-500">
              目前沒有評論，成為第一個分享的人吧！
            </div>
          )}

          {/* Real Review Cards */}
          {!loading && reviews.map((review) => {
            const date = new Date(review.timestamp).toLocaleDateString();
            const titleParts = (review.courseName || "").split(/<\/?br\s*\/?>/i);
            const mainTitle = titleParts[0];
            const subTitle = titleParts[1] ? titleParts[1].trim() : "";
            const isLikedByMe = user && review.likedBy?.includes(user.id);

            if ((review as any).visibilityState === "HIDDEN") {
              return (
                <Card key={review.reviewID} className="border-slate-100 shadow-sm opacity-60">
                  <CardContent className="p-5 flex items-center gap-3 text-sm text-muted-foreground">
                    <Flag size={14} className="shrink-0 text-slate-400" /> 此評論已被管理員隱藏，評分仍計入統計。
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={review.reviewID} className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {review.courseID} {mainTitle ? `— ${mainTitle}` : ""}
                      </h3>
                      {subTitle && <p className="text-sm font-normal text-muted-foreground mt-0.5">{subTitle}</p>}
                      <p className="text-sm text-slate-500 mt-1">User {review.authorID.substring(0, 8)}... • {date}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 items-end shrink-0 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">甜度</span>
                        <RatingIcons rating={review.sweetnessScore} type="sweetness" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">涼度</span>
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
                          <CheckCircle2 size={12} /> 推薦修課
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleLike(review.reviewID)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                          isLikedByMe ? "text-rose-600 bg-rose-50 border border-rose-100 font-bold shadow-sm scale-105" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        <ThumbsUp size={14} className={isLikedByMe ? "fill-rose-500 text-rose-500" : ""} />
                        {review.likeCount} 有幫助
                      </button>
                      {user && user.id !== review.authorID && (
                        <button
                          onClick={() => { setReportingReviewID(review.reviewID); setReportReason("SPAM"); }}
                          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                          title="檢舉此評論"
                        >
                          <Flag size={13} /> 檢舉
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}