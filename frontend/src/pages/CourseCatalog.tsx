import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

const SESSION_KEY = "courseCatalogFilters";
function loadFilters() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}
function saveFilters(filters: Record<string, string>) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(filters)); } catch {}
}
import {
  Search,
  BookOpen,
  Calendar,
  MapPin,
  Users,
  Star,
  ChevronDown,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { addBookmark, removeBookmark, isBookmarked } from "../api/bookmarkApi";
import { useSchedule } from "../context/ScheduleContext";
import {
  searchCourses,
  getDepartments,
  getAcademicYears,
  parseNTNUSchedule,
  LEVELS,
  SEMESTERS,
  type Course,
} from "../api/courseApi";

const PAGE_SIZE = 20;

function CourseStats({ sweetness, workload, count }: { sweetness: number, workload: number, count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 text-sm font-semibold mt-1">
      <span className="flex items-center gap-1 text-amber-500" title="Average Sweetness">
        <Star size={14} className="fill-amber-400 text-amber-400" />
        {sweetness.toFixed(1)}
      </span>
      <span className="flex items-center gap-1 text-blue-500" title="Average Workload">
        <BookOpen size={14} className="fill-blue-400 text-blue-400" />
        {workload.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground font-normal ml-1">
        ({count} 則評價)
      </span>
    </div>
  );
}

export default function CourseCatalog() {
  const { user } = useAuth();
  const { addToSchedule, isScheduled } = useSchedule();

  // ─── Filter state（從 sessionStorage 初始化）──────────────
  const saved = loadFilters();
  const [query, setQuery] = useState(saved.q ?? "");
  const [department, setDepartment] = useState(saved.department ?? "");
  const [level, setLevel] = useState(saved.level ?? "");
  const [semester, setSemester] = useState(saved.semester ?? "");
  const [academicYear, setAcademicYear] = useState(saved.academicYear ?? "");
  const [showFilters, setShowFilters] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);

  // ─── Data state ────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ─── Departments / years dropdowns ────────────────────────
  const [departments, setDepartments] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  // ─── Bookmarks state ──────────────────────────────────────
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loadingBookmark, setLoadingBookmark] = useState<Record<string, boolean>>({});

  // Debounce search query
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch departments & years on mount ───────────────────
  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
    getAcademicYears().then(setAcademicYears).catch(() => {});
  }, []);

  // ─── Fetch on filter change (debounced) ───────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setCourses([]);
      setTotal(0);
      setPage(1);

      try {
        const result = await searchCourses(query, department, level, semester, academicYear, PAGE_SIZE, 0);
        if (cancelled) return;
        setCourses(result.courses ?? []);
        setTotal(result.total ?? 0);

        // Check bookmark state for newly loaded courses
        if (user) {
          (result.courses ?? []).forEach(async (c) => {
            if (bookmarked[c.courseID] !== undefined) return;
            try {
              const res = await isBookmarked(user.id, c.courseID);
              if (!cancelled) setBookmarked((prev) => ({ ...prev, [c.courseID]: res.isBookmarked }));
            } catch { /* ignore */ }
          });
        }
      } catch (err) {
        console.error("[CourseCatalog] fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // 同步篩選條件到 sessionStorage
    saveFilters({ q: query, department, level, semester, academicYear });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(run, 350);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, department, level, semester, academicYear]);

  // ─── Load more (append) ────────────────────────────────────
  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await searchCourses(query, department, level, semester, academicYear, PAGE_SIZE, page * PAGE_SIZE);
      setCourses((prev) => [...prev, ...(result.courses ?? [])]);
      setPage((p) => p + 1);
    } catch (err) {
      console.error("[CourseCatalog] load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ─── Bookmark handlers ────────────────────────────────────
  const handleBookmark = async (e: React.MouseEvent, courseID: string) => {
    e.preventDefault();
    e.stopPropagation();
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

  // ─── Display filtering (saved-only is client-side) ────────
  const displayed = savedOnly ? courses.filter((c) => bookmarked[c.courseID]) : courses;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          尋找你的課程
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          探索師大 9,000+ 門課程。透過關鍵字搜尋，或依系所篩選。
        </p>
      </div>

      {/* Search + Filters */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              className="pl-10 h-11 text-base border-slate-100"
              placeholder="搜尋課程名稱、課號、老師..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Saved Only toggle */}
          <button
            onClick={() => setSavedOnly((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
              savedOnly
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-100 bg-white text-muted-foreground hover:border-slate-200 hover:text-slate-700"
            }`}
          >
            {savedOnly ? (
              <BookmarkCheck size={15} className="text-rose-500" />
            ) : (
              <Bookmark size={15} />
            )}
            已收藏的課程
          </button>

          {/* Advanced Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal size={15} />
            進階篩選
          </button>

          {showFilters && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">開課系所</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">所有系所</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Level 學制 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">學制</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="">所有學制</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Academic Year 學年 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">學年</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    <option value="">所有學年</option>
                    {academicYears.map((y) => (
                      <option key={y} value={y}>民國 {y} 年</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Semester 學期 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">學期</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">所有學期</option>
                    {SEMESTERS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-xl font-bold text-slate-800">
        {loading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" /> 搜尋中...
          </span>
        ) : (
          <>
            找到 {total.toLocaleString()} 門課程
            {savedOnly && (
              <span className="ml-2 text-sm font-normal text-rose-500">（已收藏）</span>
            )}
          </>
        )}
      </p>

      {/* Course Cards */}
      {!loading && displayed.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-card p-12 text-center text-muted-foreground">
          {savedOnly ? "你還沒有收藏任何課程。" : "找不到符合的課程，請嘗試其他關鍵字。"}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 items-start">
          {displayed.map((course) => {
            const parsed = parseNTNUSchedule(course.timeAndLocation);
            const isSaved = !!bookmarked[course.courseID];
            const professor = course.professors.join("、");
            const titleParts = course.title.split(/<\/?br\s*\/?>/i);
            const mainTitle = titleParts[0];
            const subTitle = titleParts[1] ? titleParts[1].trim() : "";

            return (
              <div key={course.courseID}>
                <Link to={`/courses/${course.courseID}`} className="block group">
                  <Card className="overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-slate-200">
                    <CardContent className="p-6 space-y-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div>
                            <span className="text-base font-bold text-slate-700">
                              {course.courseID}
                            </span>
                            <CourseStats 
                              sweetness={course.averageSweetness} 
                              workload={course.averageWorkload} 
                              count={course.reviewCount} 
                            />
                          </div>
                          <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                            {mainTitle}
                            {subTitle && (
                              <span className="block text-sm font-normal text-muted-foreground mt-1 group-hover:text-primary/70">
                                {subTitle}
                              </span>
                            )}
                          </h2>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className="bg-primary text-primary-foreground text-xs whitespace-nowrap">
                            {course.department}
                          </Badge>
                          {/* 收藏按鈕 */}
                          <button
                            disabled={loadingBookmark[course.courseID]}
                            onClick={(e) => handleBookmark(e, course.courseID)}
                            className={`rounded-full p-1.5 transition-colors ${
                              isSaved
                                ? "text-rose-500 hover:text-rose-600"
                                : "text-muted-foreground hover:text-rose-400"
                            }`}
                            title={isSaved ? "取消收藏" : "收藏"}
                          >
                            {isSaved ? (
                              <BookmarkCheck size={18} />
                            ) : (
                              <Bookmark size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {professor && (
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="shrink-0" />
                            <span>{professor}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="shrink-0" />
                          <span>{parsed.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0" />
                          <span>{parsed.location}</span>
                        </div>
                        {course.capacity > 0 && (
                          <div className="flex items-center gap-2">
                            <Users size={14} className="shrink-0" />
                            <span>名額 {course.capacity} 人</span>
                          </div>
                        )}
                      </div>

                      {/* Course code badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-slate-200 text-muted-foreground">
                          {course.courseCode}
                        </Badge>
                        {course.syllabusURL && (
                          <button
                            onClick={(e) => {
                            e.preventDefault(); // Prevents the router link from triggering
                            e.stopPropagation(); // Stops the click from bubbling up to the Card
                            window.open(course.syllabusURL, '_blank');
                            }}
                            className="text-xs text-primary hover:underline cursor-pointer"
>
                              課程大綱 ↗
                          </button>
                        )}
                      </div>

                      {/* Add to Schedule */}
                      <div
                        className="pt-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToSchedule({
                            courseID: course.courseID,
                            serialNumber: course.courseID,
                            title: course.title,
                            department: course.department,
                            credits: course.credits,
                            professor,
                            schedule: parsed.schedule,
                            location: parsed.location,
                            days: parsed.days,
                            timeSlot: parsed.timeSlot,
                          });
                        }}
                      >
                        <Button
                          className={`w-full font-semibold transition-colors ${
                            isScheduled(course.courseID)
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : ""
                          }`}
                          size="sm"
                        >
                          {isScheduled(course.courseID)
                            ? "✓ 已加入課表"
                            : "加入課表"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {!savedOnly && courses.length < total && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            className="border-slate-200 px-8"
            disabled={loadingMore}
            onClick={handleLoadMore}
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" /> 載入中...
              </span>
            ) : (
              `載入更多（還有 ${total - courses.length} 門）`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
