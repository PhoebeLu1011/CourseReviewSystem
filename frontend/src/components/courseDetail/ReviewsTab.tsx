import { useCallback, useEffect, useState } from "react";
import type React from "react";
import {
  CheckCircle2,
  Flag,
  Loader2,
  PenLine,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";

import {
  createReview,
  getCourseReviews,
  toggleLikeReview,
  type Review,
} from "../../api/reviewApi";
import { submitReport } from "../../api/reportApi";
import { useAuth } from "../../context/AuthContext";
import type { ReportReason } from "../../models/Report";
import { getErrorMessage } from "../../utils/errors";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { CourseView } from "./courseDetailTypes";
import { RatingIcons } from "./RatingIcons";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "垃圾內容" },
  { value: "HARASSMENT", label: "騷擾或霸凌" },
  { value: "OFFENSIVE_CONTENT", label: "不當內容" },
  { value: "FALSE_INFORMATION", label: "虛假資訊" },
  { value: "INAPPROPRIATE_LANGUAGE", label: "不當用語" },
  { value: "OTHER", label: "其他" },
];

export function ReviewsTab({ course }: { course: CourseView }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const [sweetness, setSweetness] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportingReviewID, setReportingReviewID] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("SPAM");
  const [isReporting, setIsReporting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await getCourseReviews(course.courseID, sortBy));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [course.courseID, sortBy]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return alert("請先登入才能撰寫評論！");
    if (sweetness === 0 || workload === 0) return alert("請評分甜度與涼度！");

    setIsSubmitting(true);
    try {
      await createReview({
        courseID: course.courseID,
        content,
        sweetnessScore: sweetness,
        workloadScore: workload,
      });
      setIsWriting(false);
      setContent("");
      setSweetness(0);
      setWorkload(0);
      await fetchReviews();
    } catch (error) {
      alert(getErrorMessage(error, "送出評論失敗，請稍後再試。"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (reviewID: string) => {
    if (!user) return alert("請先登入才能按讚！");

    try {
      const result = await toggleLikeReview(reviewID);
      setReviews((current) =>
        current.map((review) =>
          review.reviewID === reviewID
            ? { ...review, likeCount: result.likeCount }
            : review
        )
      );
    } catch (error) {
      alert(getErrorMessage(error, "按讚失敗，請稍後再試。"));
    }
  };

  const handleReport = async () => {
    if (!user || !reportingReviewID) return;
    setIsReporting(true);

    try {
      await submitReport({
        reported_type: "review",
        reported_id: reportingReviewID,
        reason: reportReason,
      });
      alert("檢舉已送出，謝謝您的回報。");
      setReportingReviewID(null);
    } catch (error) {
      const message = getErrorMessage(error, "");
      alert(
        message === "Already reported this review"
          ? "你已經檢舉過這則評論了。"
          : "檢舉失敗，請稍後再試。"
      );
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {reportingReviewID && (
        <ReportModal
          reason={reportReason}
          isSubmitting={isReporting}
          onReasonChange={setReportReason}
          onClose={() => setReportingReviewID(null)}
          onSubmit={() => void handleReport()}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <RatingSummary course={course} />

        <div className="space-y-4 lg:col-span-2">
          <ReviewsHeader
            count={reviews.length}
            sortBy={sortBy}
            isWriting={isWriting}
            onSortChange={setSortBy}
            onToggleWriting={() => {
              if (!isWriting) {
                setContent("");
                setSweetness(0);
                setWorkload(0);
              }
              setIsWriting((current) => !current);
            }}
          />

          {isWriting && (
            <ReviewForm
              content={content}
              sweetness={sweetness}
              workload={workload}
              isSubmitting={isSubmitting}
              onContentChange={setContent}
              onSweetnessChange={setSweetness}
              onWorkloadChange={setWorkload}
              onSubmit={handleSubmit}
            />
          )}

          <ReviewList
            loading={loading}
            reviews={reviews}
            currentUserId={user?.id}
            onLike={(reviewID) => void handleToggleLike(reviewID)}
            onReport={(reviewID) => {
              setReportingReviewID(reviewID);
              setReportReason("SPAM");
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  reason,
  isSubmitting,
  onReasonChange,
  onClose,
  onSubmit,
}: {
  reason: ReportReason;
  isSubmitting: boolean;
  onReasonChange: (reason: ReportReason) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">檢舉評論</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">請選擇檢舉原因：</p>

        <div className="space-y-2">
          {REPORT_REASONS.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="reportReason"
                value={item.value}
                checked={reason === item.value}
                onChange={() => onReasonChange(item.value)}
                className="accent-primary"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            {isSubmitting ? "送出中..." : "送出檢舉"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingSummary({ course }: { course: CourseView }) {
  return (
    <Card className="h-fit border-slate-100 shadow-sm lg:col-span-1">
      <CardContent className="p-6">
        <h3 className="mb-6 font-bold text-slate-800">評分總覽</h3>
        <div className="mb-8 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-slate-900">
            {course.averageSweetness?.toFixed(1) || "0.0"}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">平均甜度</span>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <ScoreRow label="甜度" value={`${course.averageSweetness?.toFixed(1) || "0.0"} / 5`} />
          <ScoreRow label="涼度" value={`${course.averageWorkload?.toFixed(1) || "0.0"} / 5`} />
          <div className="flex justify-between pt-2">
            <span className="text-xs text-muted-foreground">評論數</span>
            <span className="text-xs font-medium text-slate-500">
              {course.reviewCount || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function ReviewsHeader({
  count,
  sortBy,
  isWriting,
  onSortChange,
  onToggleWriting,
}: {
  count: number;
  sortBy: string;
  isWriting: boolean;
  onSortChange: (value: string) => void;
  onToggleWriting: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-2">
      <div>
        <h3 className="text-base font-bold text-slate-800">學生評論</h3>
        <span className="text-sm text-muted-foreground">共 {count} 則</span>
        <div className="mt-2">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-md border border-slate-200 bg-white p-1.5 text-xs font-medium text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">最新優先</option>
            <option value="popular">最有幫助</option>
          </select>
        </div>
      </div>

      <Button onClick={onToggleWriting} className="gap-2" size="sm">
        <PenLine size={15} /> {isWriting ? "取消" : "撰寫評論"}
      </Button>
    </div>
  );
}

function ReviewForm({
  content,
  sweetness,
  workload,
  isSubmitting,
  onContentChange,
  onSweetnessChange,
  onWorkloadChange,
  onSubmit,
}: {
  content: string;
  sweetness: number;
  workload: number;
  isSubmitting: boolean;
  onContentChange: (value: string) => void;
  onSweetnessChange: (value: number) => void;
  onWorkloadChange: (value: number) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Card className="mb-6 border-primary/20 bg-slate-50/50 shadow-md">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-8 py-2">
            <RatingField label="甜度" rating={sweetness} type="sweetness" onChange={onSweetnessChange} />
            <RatingField label="涼度" rating={workload} type="workload" onChange={onWorkloadChange} />
          </div>

          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="分享你對這門課的看法..."
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            送出評論
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

function RatingField({
  label,
  rating,
  type,
  onChange,
}: {
  label: string;
  rating: number;
  type: "sweetness" | "workload";
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <RatingIcons rating={rating} type={type} interactive setRating={onChange} />
    </div>
  );
}

function ReviewList({
  loading,
  reviews,
  currentUserId,
  onLike,
  onReport,
}: {
  loading: boolean;
  reviews: Review[];
  currentUserId?: string;
  onLike: (reviewID: string) => void;
  onReport: (reviewID: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 bg-card p-8 text-center text-sm text-muted-foreground">
        還沒有評論，成為第一個評論的人吧！
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <ReviewCard
          key={review.reviewID}
          review={review}
          currentUserId={currentUserId}
          onLike={onLike}
          onReport={onReport}
        />
      ))}
    </>
  );
}

function ReviewCard({
  review,
  currentUserId,
  onLike,
  onReport,
}: {
  review: Review;
  currentUserId?: string;
  onLike: (reviewID: string) => void;
  onReport: (reviewID: string) => void;
}) {
  const date = new Date(review.timestamp).toLocaleDateString();

  if (review.visibilityState === "HIDDEN") {
    return (
      <Card className="border-slate-100 opacity-60 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <Flag size={14} className="shrink-0 text-slate-400" />
          此評論已被管理員隱藏，評分仍計入統計。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="mt-1 text-sm font-semibold text-slate-600">
            User {review.authorID.substring(0, 8)}... • {date}
          </p>

          <div className="flex shrink-0 flex-col items-end gap-1.5 pt-1">
            <ReviewRating label="甜度" rating={review.sweetnessScore} type="sweetness" />
            <ReviewRating label="涼度" rating={review.workloadScore} type="workload" />
          </div>
        </div>

        <div className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {review.content}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            {review.sweetnessScore >= 4 && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-emerald-600">
                <CheckCircle2 size={12} /> 推薦修課
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(review.reviewID)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <ThumbsUp size={14} /> {review.likeCount} 有幫助
            </button>

            {currentUserId && currentUserId !== review.authorID && (
              <button
                onClick={() => onReport(review.reviewID)}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-rose-500"
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
}

function ReviewRating({
  label,
  rating,
  type,
}: {
  label: string;
  rating: number;
  type: "sweetness" | "workload";
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <RatingIcons rating={rating} type={type} />
    </div>
  );
}
