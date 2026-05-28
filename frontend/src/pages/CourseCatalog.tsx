import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { addBookmark, removeBookmark, isBookmarked } from "../api/bookmarkApi";
import { submitReport } from "../api/reportApi";
import type { ReportReason } from "../models/Report";

const mockCourses = [
  {
    courseID: "CS101",
    courseName: "Introduction to Computer Science",
    department: "Computer Science",
    teacher: "Prof. Wang",
    reviews: [
      { reviewID: "r001", author: "Alice", content: "很棒的課程，老師解釋得很清楚！", sweetness: 4, workload: 3 },
      { reviewID: "r002", author: "Bob", content: "作業有點多，但收穫很大。", sweetness: 3, workload: 4 },
    ],
  },
  {
    courseID: "CE201",
    courseName: "Engineering Mechanics",
    department: "Civil Engineering",
    teacher: "Prof. Lin",
    reviews: [
      { reviewID: "r003", author: "Carol", content: "期中考很難，建議早點準備。", sweetness: 2, workload: 5 },
    ],
  },
];

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "垃圾內容" },
  { value: "HARASSMENT", label: "騷擾" },
  { value: "OFFENSIVE_CONTENT", label: "不當內容" },
  { value: "FALSE_INFORMATION", label: "錯誤資訊" },
  { value: "INAPPROPRIATE_LANGUAGE", label: "不適當語言" },
  { value: "OTHER", label: "其他" },
];

export default function CourseCatalog() {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loadingBookmark, setLoadingBookmark] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // 檢舉 modal 狀態
  const [reportModal, setReportModal] = useState<{ open: boolean; reviewID: string }>({
    open: false,
    reviewID: "",
  });
  const [reportReason, setReportReason] = useState<ReportReason>("SPAM");
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    mockCourses.forEach(async (course) => {
      try {
        const res = await isBookmarked(user.id, course.courseID);
        setBookmarked((prev) => ({ ...prev, [course.courseID]: res.isBookmarked }));
      } catch {
        // 忽略錯誤
      }
    });
  }, [user]);

  const handleBookmark = async (courseID: string) => {
    if (!user) return alert("請先登入");
    setLoadingBookmark((prev) => ({ ...prev, [courseID]: true }));
    try {
      if (bookmarked[courseID]) {
        await removeBookmark(user.id, courseID);
        setBookmarked((prev) => ({ ...prev, [courseID]: false }));
      } else {
        await addBookmark(user.id, { courseId: courseID });
        setBookmarked((prev) => ({ ...prev, [courseID]: true }));
      }
    } catch {
      alert("操作失敗，請稍後再試");
    } finally {
      setLoadingBookmark((prev) => ({ ...prev, [courseID]: false }));
    }
  };

  const handleReport = async () => {
    if (!user) return alert("請先登入");
    try {
      await submitReport({
        reporterID: user.id,
        reviewID: reportModal.reviewID,
        reason: reportReason,
      });
      setReportMsg("檢舉已送出，感謝您的回報！");
    } catch (e: any) {
      setReportMsg(
        e.message === "Already reported this review"
          ? "你已經檢舉過這則評論。"
          : "檢舉失敗，請稍後再試。"
      );
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Course Catalog</h1>
        <p className="mt-2 text-muted-foreground">
          Browse courses and read student reviews.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockCourses.map((course) => (
          <Card key={course.courseID}>
            <CardContent className="p-5">
              {/* 課程資訊 + 收藏按鈕 */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{course.courseName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{course.department}</p>
                  <p className="mt-3 text-sm">Instructor: {course.teacher}</p>
                  <p className="mt-1 text-sm">Course ID: {course.courseID}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loadingBookmark[course.courseID]}
                  onClick={() => handleBookmark(course.courseID)}
                  title={bookmarked[course.courseID] ? "取消收藏" : "收藏"}
                >
                  {bookmarked[course.courseID]
                    ? <BookmarkCheck className="text-rose-600" size={20} />
                    : <Bookmark size={20} />}
                </Button>
              </div>

              {/* 展開/收合評論 */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-muted-foreground gap-1"
                onClick={() =>
                  setExpandedReviews((prev) => ({
                    ...prev,
                    [course.courseID]: !prev[course.courseID],
                  }))
                }
              >
                {expandedReviews[course.courseID] ? (
                  <><ChevronUp size={14} /> 收合評論</>
                ) : (
                  <><ChevronDown size={14} /> 查看評論 ({course.reviews.length})</>
                )}
              </Button>

              {/* 評論列表 */}
              {expandedReviews[course.courseID] && (
                <div className="mt-3 flex flex-col gap-3">
                  {course.reviews.map((review) => (
                    <div key={review.reviewID} className="rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{review.author}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500 gap-1"
                          onClick={() => {
                            setReportModal({ open: true, reviewID: review.reviewID });
                            setReportMsg("");
                            setReportReason("SPAM");
                          }}
                        >
                          <Flag size={12} />
                          檢舉
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{review.content}</p>
                      <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span>甜度 {'⭐'.repeat(review.sweetness)}</span>
                        <span>涼度 {'😅'.repeat(review.workload)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 檢舉 Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">檢舉評論</h2>

            {reportMsg ? (
              <p className="text-sm text-center py-4">{reportMsg}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">請選擇檢舉原因：</p>
                <div className="flex flex-col gap-2 mb-6">
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reportReason === r.value}
                        onChange={() => setReportReason(r.value)}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setReportModal({ open: false, reviewID: "" })}>
                    取消
                  </Button>
                  <Button variant="destructive" onClick={handleReport}>
                    送出檢舉
                  </Button>
                </div>
              </>
            )}

            {reportMsg && (
              <div className="flex justify-end mt-4">
                <Button onClick={() => setReportModal({ open: false, reviewID: "" })}>關閉</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
