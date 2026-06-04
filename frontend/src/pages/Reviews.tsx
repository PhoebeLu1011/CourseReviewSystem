import { useState, useEffect } from "react";
import { Search, Star, ThumbsUp, CheckCircle2, Lock, Loader2, Send, BookOpen } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Link } from "react-router";
// 💡 UPDATED: Imported toggleLikeReview
import { getCourseReviews, getAllReviews, createReview, toggleLikeReview, type Review } from "../api/reviewApi";
import { useAuth } from "../context/AuthContext"; // 💡 NEW: Import Auth Context

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
  const { user } = useAuth(); // 💡 NEW: Pull true student state info
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("All Courses"); 

  // Form State
  const [isWriting, setIsWriting] = useState(false);
  const [newReviewCourse, setNewReviewCourse] = useState(""); 
  const [content, setContent] = useState("");
  const [sweetness, setSweetness] = useState(0); 
  const [workload, setWorkload] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let data;
      if (!selectedCourse || selectedCourse === "All Courses") {
        data = await getAllReviews(""); 
      } else {
        data = await getAllReviews(selectedCourse); 
      }
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedCourse]);

  // 💡 NEW: Like Click Handler Function
  const handleToggleLike = async (reviewID: string) => {
    if (!user) return alert("Please log in to like a review!");
    
    try {
      const result = await toggleLikeReview(reviewID, user.id);
      
      // Dynamic local map array state shift: updates count without jarring list refetches
      setReviews(prev => 
        prev.map(r => r.reviewID === reviewID ? { 
          ...r, 
          likeCount: result.likeCount,
          likedBy: r.likedBy?.includes(user.id) 
            ? r.likedBy.filter(id => id !== user.id) 
            : [...(r.likedBy || []), user.id]
        } : r)
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !newReviewCourse.trim()) return;
    if (sweetness === 0 || workload === 0) {
      alert("Please provide a rating for both Sweetness and Workload.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createReview({
        authorID: user?.id || "student_123", // 💡 UPDATED: Uses live authenticated ID if present
        courseID: newReviewCourse,
        content: content,
        sweetnessScore: sweetness,
        workloadScore: workload
      });
      
      setContent("");
      setIsWriting(false);
      fetchReviews();
    } catch (error: any) {
      console.error("Error posting review:", error);
      alert(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Course Reviews</h1>
          <p className="text-muted-foreground mt-1">Read student reviews and ratings for all courses</p>
        </div>
        <button 
          onClick={() => {
            if (!isWriting) {
              setNewReviewCourse("");
              setContent("");
              setSweetness(0);
              setWorkload(0);
            }
            setIsWriting(!isWriting);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {isWriting ? "Cancel" : "Write a Review"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg">Filters</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Course ID</label>
                <Input 
                  className="bg-slate-50/50" 
                  placeholder="Enter Course ID (or 'All Courses')" 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                />
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
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Post a New Review</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Course ID</label>
                      <Input 
                        value={newReviewCourse}
                        onChange={(e) => setNewReviewCourse(e.target.value)}
                        placeholder="e.g., 5002"
                        required
                      />
                    </div>
                  </div>

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

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Your Review</label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="What did you think of the professor, assignments, and exams?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    Post Review
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
                <span>Log in to post a review or report content.</span>
                <Link to="/login" className="font-semibold text-primary hover:underline">Login here</Link>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{reviews.length} reviews</span>
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
              No reviews found. Be the first to share your experience!
            </div>
          )}

          {/* Real Review Cards */}
          {!loading && reviews.map((review) => {
            const date = new Date(review.timestamp).toLocaleDateString();
            const titleParts = (review.courseName || "").split(/<\/?br\s*\/?>/i);
            const mainTitle = titleParts[0];
            const subTitle = titleParts[1] ? titleParts[1].trim() : "";
            
            // 💡 Check if current user has liked this specific review
            const isLikedByMe = user && review.likedBy?.includes(user.id);

            return (
              <Card key={review.reviewID} className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {review.courseID} {mainTitle ? `— ${mainTitle}` : ""}
                      </h3>
                      {subTitle && (
                        <p className="text-sm font-normal text-muted-foreground mt-0.5">
                          {subTitle}
                        </p>
                      )}
                      <p className="text-sm text-slate-500 mt-1">
                        User {review.authorID.substring(0, 8)}... • {date}
                      </p>
                    </div>
                    
                    {/* Ratings */}
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

                  {/* Body */}
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
                    {review.content}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      {review.sweetnessScore >= 4 && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5 border border-emerald-100">
                          <CheckCircle2 size={12} /> Would Recommend
                        </span>
                      )}
                    </div>
                    
                    {/* 💡 UPDATED: Linked button to click handler and styled active state */}
                    <button 
                      onClick={() => handleToggleLike(review.reviewID)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                        isLikedByMe 
                          ? "text-rose-600 bg-rose-50 border border-rose-100 font-bold shadow-sm scale-105" 
                          : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <ThumbsUp size={14} className={isLikedByMe ? "fill-rose-500 text-rose-500" : ""} /> 
                      {review.likeCount} Helpful
                    </button>
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