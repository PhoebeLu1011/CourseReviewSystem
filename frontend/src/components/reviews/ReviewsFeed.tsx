import { Link } from "react-router";
import { CheckCircle2, Flag, Loader2, Lock, ThumbsUp } from "lucide-react";

import type { Review } from "../../api/reviewApi";
import type { AuthUser } from "../../api/userApi";
import { cleanCourseTitle, formatCourseDisplayCode } from "../../utils/courseDisplay";
import { Card, CardContent } from "../ui/card";
import { ReviewRatingIcons } from "./ReviewRatingIcons";

interface ReviewsFeedProps {
  user: AuthUser | null;
  reviews: Review[];
  loading: boolean;
  isWriting: boolean;
  onToggleLike: (reviewID: string) => void;
  onReport: (reviewID: string) => void;
}

export function ReviewsFeed({
  user,
  reviews,
  loading,
  isWriting,
  onToggleLike,
  onReport,
}: ReviewsFeedProps) {
  return (
    <>
      {!user && !isWriting && <LoginBanner reviewCount={reviews.length} />}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-slate-500">
          目前沒有評論，成為第一個分享的人吧！
        </div>
      )}

      {!loading &&
        reviews.map((review) => (
          <ReviewCard
            key={review.reviewID}
            review={review}
            user={user}
            onToggleLike={onToggleLike}
            onReport={onReport}
          />
        ))}
    </>
  );
}

function LoginBanner({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Lock size={16} className="text-slate-400" />
        <span>請先登入才能撰寫評論或檢舉內容。</span>
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          前往登入
        </Link>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {reviewCount} 則評論
      </span>
    </div>
  );
}

function ReviewCard({
  review,
  user,
  onToggleLike,
  onReport,
}: {
  review: Review;
  user: AuthUser | null;
  onToggleLike: (reviewID: string) => void;
  onReport: (reviewID: string) => void;
}) {
  if (review.visibilityState === "HIDDEN") {
    return (
      <Card className="border-slate-100 shadow-sm opacity-60">
        <CardContent className="p-5 flex items-center gap-3 text-sm text-muted-foreground">
          <Flag size={14} className="shrink-0 text-slate-400" />
          此評論已被管理員隱藏，評分仍計入統計。
        </CardContent>
      </Card>
    );
  }

  const date = new Date(review.timestamp).toLocaleDateString();
  const titleParts = (review.courseName || "").split(/<\/?br\s*\/?>/i);
  const mainTitle = cleanCourseTitle(review.courseName);
  const subTitle = titleParts[1] ? titleParts[1].trim() : "";
  const courseCode = formatCourseDisplayCode(review.courseID);
  const isLikedByMe = Boolean(user && review.likedBy?.includes(user.id));

  return (
    <Card className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {courseCode} {mainTitle ? `— ${mainTitle}` : ""}
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

          <div className="flex flex-col gap-1.5 items-end shrink-0 pt-1">
            <ScoreLine label="甜度" rating={review.sweetnessScore} type="sweetness" />
            <ScoreLine label="涼度" rating={review.workloadScore} type="workload" />
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
              onClick={() => onToggleLike(review.reviewID)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                isLikedByMe
                  ? "text-rose-600 bg-rose-50 border border-rose-100 font-bold shadow-sm scale-105"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <ThumbsUp
                size={14}
                className={isLikedByMe ? "fill-rose-500 text-rose-500" : ""}
              />
              {review.likeCount} 有幫助
            </button>
            {user && user.id !== review.authorID && (
              <button
                onClick={() => onReport(review.reviewID)}
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
}

function ScoreLine({
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
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <ReviewRatingIcons rating={rating} type={type} />
    </div>
  );
}
