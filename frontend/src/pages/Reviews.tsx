import { useCallback, useEffect, useState, type FormEvent } from "react";

import { getDepartments } from "../api/courseApi";
import {
  createReview,
  getAllReviews,
  toggleLikeReview,
  type Review,
} from "../api/reviewApi";
import { submitReport } from "../api/reportApi";
import { ReviewFormCard } from "../components/reviews/ReviewFormCard";
import { ReviewReportDialog } from "../components/reviews/ReviewReportDialog";
import { ReviewsFeed } from "../components/reviews/ReviewsFeed";
import { ReviewsFiltersPanel } from "../components/reviews/ReviewsFiltersPanel";
import { ReviewsHeader } from "../components/reviews/ReviewsHeader";
import { useAuth } from "../context/AuthContext";
import type { ReportReason } from "../models/Report";
import { getErrorMessage } from "../utils/errors";

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [departments, setDepartments] = useState<string[]>([]);

  const [isWriting, setIsWriting] = useState(false);
  const [newReviewCourse, setNewReviewCourse] = useState("");
  const [content, setContent] = useState("");
  const [sweetness, setSweetness] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportingReviewID, setReportingReviewID] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("SPAM");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReviews(
        selectedCourse,
        sortBy,
        selectedDepartment,
      );
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, sortBy, selectedDepartment]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const resetReviewForm = () => {
    setNewReviewCourse("");
    setContent("");
    setSweetness(0);
    setWorkload(0);
  };

  const handleToggleWriting = () => {
    if (!isWriting) resetReviewForm();
    setIsWriting((value) => !value);
  };

  const handleToggleLike = async (reviewID: string) => {
    if (!user) {
      alert("請先登入才能按讚評論。");
      return;
    }

    try {
      const result = await toggleLikeReview(reviewID);
      setReviews((prev) =>
        prev.map((review) =>
          review.reviewID === reviewID
            ? {
                ...review,
                likeCount: result.likeCount,
                likedBy: review.likedBy?.includes(user.id)
                  ? review.likedBy.filter((id) => id !== user.id)
                  : [...(review.likedBy || []), user.id],
              }
            : review,
        ),
      );
    } catch (error: unknown) {
      alert(getErrorMessage(error, "按讚失敗，請稍後再試。"));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || !newReviewCourse.trim()) return;
    if (sweetness === 0 || workload === 0) {
      alert("請提供甜度與涼度評分。");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        courseID: newReviewCourse,
        content,
        sweetnessScore: sweetness,
        workloadScore: workload,
      });
      resetReviewForm();
      setIsWriting(false);
      void fetchReviews();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "送出評論失敗，請稍後再試。"));
    } finally {
      setIsSubmitting(false);
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
    } catch (err: unknown) {
      const message = getErrorMessage(err, "");
      alert(
        message === "Already reported this review"
          ? "你已經檢舉過這則評論了。"
          : "檢舉失敗，請稍後再試。",
      );
    } finally {
      setIsReporting(false);
    }
  };

  const openReportDialog = (reviewID: string) => {
    setReportingReviewID(reviewID);
    setReportReason("SPAM");
  };

  return (
    <div className="pb-12 space-y-6">
      {reportingReviewID && (
        <ReviewReportDialog
          reason={reportReason}
          isSubmitting={isReporting}
          onReasonChange={setReportReason}
          onCancel={() => setReportingReviewID(null)}
          onSubmit={handleReport}
        />
      )}

      <ReviewsHeader isWriting={isWriting} onToggleWriting={handleToggleWriting} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <ReviewsFiltersPanel
          selectedCourse={selectedCourse}
          selectedDepartment={selectedDepartment}
          sortBy={sortBy}
          departments={departments}
          onCourseChange={setSelectedCourse}
          onDepartmentChange={setSelectedDepartment}
          onSortChange={setSortBy}
        />

        <div className="lg:col-span-3 space-y-5">
          {isWriting && (
            <ReviewFormCard
              courseID={newReviewCourse}
              content={content}
              sweetness={sweetness}
              workload={workload}
              isSubmitting={isSubmitting}
              onCourseIDChange={setNewReviewCourse}
              onContentChange={setContent}
              onSweetnessChange={setSweetness}
              onWorkloadChange={setWorkload}
              onSubmit={handleSubmit}
            />
          )}

          <ReviewsFeed
            user={user}
            reviews={reviews}
            loading={loading}
            isWriting={isWriting}
            onToggleLike={handleToggleLike}
            onReport={openReportDialog}
          />
        </div>
      </div>
    </div>
  );
}
