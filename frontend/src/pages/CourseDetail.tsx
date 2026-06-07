import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";

import { addBookmark, isBookmarked, removeBookmark } from "../api/bookmarkApi";
import { getCourse, parseNTNUSchedule } from "../api/courseApi";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { DiscussionsTab } from "../components/courseDetail/DiscussionsTab";
import { OverviewTab } from "../components/courseDetail/OverviewTab";
import { ReviewsTab } from "../components/courseDetail/ReviewsTab";
import { SyllabusTab } from "../components/courseDetail/SyllabusTab";
import type { CourseView } from "../components/courseDetail/courseDetailTypes";
import { useAuth } from "../context/AuthContext";
import { useSchedule } from "../context/ScheduleContext";

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
      .then((response) => setIsSaved(response.isBookmarked))
      .catch(() => undefined);
  }, [user, courseID]);

  const handleBookmark = async () => {
    if (!user) return alert("請先登入");
    if (!courseID) return;

    setLoadingSave(true);

    try {
      if (isSaved) {
        await removeBookmark(user.id, courseID);
        setIsSaved(false);
      } else {
        await addBookmark(user.id, { courseId: courseID });
        setIsSaved(true);
      }
    } catch {
      alert("操作失敗，請稍後再試");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingCourse) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="space-y-4 py-20 text-center">
        <p className="text-xl font-semibold text-slate-700">找不到這門課程。</p>
        <Link to="/courses" className="text-sm text-primary hover:underline">
          ← 回到課程目錄
        </Link>
      </div>
    );
  }

  const titleParts = (course.title || "").split(/<\/?br\s*\/?>/i);
  const mainTitle = titleParts[0];
  const subTitle = titleParts[1] ? titleParts[1].trim() : "";

  return (
    <div className="space-y-6 pb-12">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} /> 回到課程目錄
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {course.serialNumber || course.courseID}{" "}
            {mainTitle ? `— ${mainTitle}` : ""}
          </h1>

          {subTitle && (
            <p className="mt-1 text-lg text-muted-foreground">{subTitle}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{course.department}</Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={loadingSave}
            onClick={handleBookmark}
            className={`rounded-full p-1.5 transition-colors ${
              isSaved
                ? "text-rose-500 hover:text-rose-600"
                : "text-muted-foreground hover:text-rose-400"
            }`}
            aria-label={isSaved ? "取消收藏" : "收藏課程"}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>

          <Button
            className={`font-semibold transition-colors ${
              isScheduled(course.courseID)
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : ""
            }`}
            onClick={() => {
              addToSchedule({
                courseID: course.courseID,
                serialNumber: course.serialNumber || course.courseID,
                title: course.title,
                department: course.department,
                credits: course.credits,
                professor: course.professor,
                schedule: course.schedule,
                location: course.location,
                days: course.days,
                timeSlot: course.timeSlot,
              });
            }}
          >
            {isScheduled(course.courseID) ? "✓ 已加入課表" : "加入課表"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="overview" className="flex-1 rounded-lg">
            課程資訊
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="flex-1 rounded-lg">
            課程大綱
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-lg">
            評論
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex-1 rounded-lg">
            討論
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <OverviewTab course={course} />
        </TabsContent>

        <TabsContent value="syllabus" className="mt-5">
          <SyllabusTab course={course} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-5">
          <ReviewsTab course={course} />
        </TabsContent>

        <TabsContent value="discussions" className="mt-5">
          <DiscussionsTab courseID={course.courseID} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
