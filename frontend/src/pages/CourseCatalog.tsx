import { useEffect, useRef, useState, type MouseEvent } from "react";

import {
  addBookmark,
  isBookmarked,
  removeBookmark,
} from "../api/bookmarkApi";
import {
  getAcademicYears,
  getDepartments,
  searchCourses,
  type Course,
} from "../api/courseApi";
import { CourseCatalogFilters } from "../components/courseCatalog/CourseCatalogFilters";
import { CourseCatalogHero } from "../components/courseCatalog/CourseCatalogHero";
import { CourseCatalogResults } from "../components/courseCatalog/CourseCatalogResults";
import { CourseResultSummary } from "../components/courseCatalog/CourseResultSummary";
import { LoadMoreCoursesButton } from "../components/courseCatalog/LoadMoreCoursesButton";
import { useAuth } from "../context/AuthContext";
import { useSchedule } from "../context/ScheduleContext";

const PAGE_SIZE = 20;
const SESSION_KEY = "courseCatalogFilters";

interface CatalogFilters {
  q?: string;
  department?: string;
  level?: string;
  semester?: string;
  academicYear?: string;
}

function loadFilters(): CatalogFilters {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveFilters(filters: Record<string, string>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(filters));
  } catch {
    // Filters remain usable in memory when session storage is unavailable.
  }
}

export default function CourseCatalog() {
  const { user } = useAuth();
  const { addToSchedule, isScheduled } = useSchedule();
  const saved = loadFilters();

  const [query, setQuery] = useState(saved.q ?? "");
  const [department, setDepartment] = useState(saved.department ?? "");
  const [level, setLevel] = useState(saved.level ?? "");
  const [semester, setSemester] = useState(saved.semester ?? "");
  const [academicYear, setAcademicYear] = useState(saved.academicYear ?? "");
  const [showFilters, setShowFilters] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loadingBookmark, setLoadingBookmark] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => undefined);
    getAcademicYears().then(setAcademicYears).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateBookmarks = (items: Course[]) => {
      if (!user) return;
      items.forEach(async (course) => {
        try {
          const result = await isBookmarked(user.id, course.courseID);
          if (!cancelled) {
            setBookmarked((prev) => ({
              ...prev,
              [course.courseID]: result.isBookmarked,
            }));
          }
        } catch {
          // Bookmark badges are nice-to-have; the course list should not fail with them.
        }
      });
    };

    const run = async () => {
      setLoading(true);
      setCourses([]);
      setTotal(0);
      setPage(1);

      try {
        const result = await searchCourses(
          query,
          department,
          level,
          semester,
          academicYear,
          PAGE_SIZE,
          0,
        );
        if (cancelled) return;

        const nextCourses = result.courses ?? [];
        setCourses(nextCourses);
        setTotal(result.total ?? 0);
        hydrateBookmarks(nextCourses);
      } catch (err) {
        console.error("[CourseCatalog] fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    saveFilters({ q: query, department, level, semester, academicYear });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(run, 350);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, department, level, semester, academicYear, user]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await searchCourses(
        query,
        department,
        level,
        semester,
        academicYear,
        PAGE_SIZE,
        page * PAGE_SIZE,
      );
      setCourses((prev) => [...prev, ...(result.courses ?? [])]);
      setPage((currentPage) => currentPage + 1);
    } catch (err) {
      console.error("[CourseCatalog] load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBookmark = async (
    event: MouseEvent<HTMLButtonElement>,
    courseID: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      alert("請先登入");
      return;
    }

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

  const displayedCourses = savedOnly
    ? courses.filter((course) => bookmarked[course.courseID])
    : courses;

  return (
    <div className="space-y-8 pb-12">
      <CourseCatalogHero />

      <CourseCatalogFilters
        query={query}
        department={department}
        level={level}
        semester={semester}
        academicYear={academicYear}
        savedOnly={savedOnly}
        showFilters={showFilters}
        departments={departments}
        academicYears={academicYears}
        onQueryChange={setQuery}
        onDepartmentChange={setDepartment}
        onLevelChange={setLevel}
        onSemesterChange={setSemester}
        onAcademicYearChange={setAcademicYear}
        onToggleSavedOnly={() => setSavedOnly((value) => !value)}
        onToggleFilters={() => setShowFilters((value) => !value)}
      />

      <CourseResultSummary loading={loading} total={total} savedOnly={savedOnly} />

      {!loading && (
        <CourseCatalogResults
          courses={displayedCourses}
          savedOnly={savedOnly}
          bookmarked={bookmarked}
          loadingBookmark={loadingBookmark}
          isScheduled={isScheduled}
          onBookmark={handleBookmark}
          onAddToSchedule={addToSchedule}
        />
      )}

      <LoadMoreCoursesButton
        hidden={savedOnly || courses.length >= total}
        loading={loadingMore}
        remaining={total - courses.length}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
