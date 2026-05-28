import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { addBookmark, removeBookmark, isBookmarked } from "../api/bookmarkApi";
import { useSchedule, parseSchedule } from "../context/ScheduleContext";

// ─── Mock Data ───────────────────────────────────────────────
interface MockCourse {
  courseID: string;
  serialNumber: string;
  title: string;
  department: string;
  level: "Undergraduate" | "Graduate";
  credits: number;
  professor: string;
  schedule: string;
  location: string;
  enrolled: number;
  capacity: number;
  rating: number;
  reviewCount: number;
  description: string;
  genEd: string[];
  prerequisites: string[];
}

const mockCourses: MockCourse[] = [
  {
    courseID: "CS101",
    serialNumber: "CS 101",
    title: "Introduction to Computer Science",
    department: "Computer Science",
    level: "Undergraduate",
    credits: 4,
    professor: "Dr. Sarah Johnson",
    schedule: "Mon, Wed, Fri • 9:00 AM - 10:15 AM",
    location: "Engineering Building, Room 201",
    enrolled: 98,
    capacity: 120,
    rating: 4.5,
    reviewCount: 127,
    description:
      "An introduction to the intellectual enterprises of computer science and the art of programming. Topics include abstraction, algorithms, data structures, and software engineering.",
    genEd: ["Quantitative Reasoning"],
    prerequisites: [],
  },
  {
    courseID: "CS202",
    serialNumber: "CS 202",
    title: "Data Structures and Algorithms",
    department: "Computer Science",
    level: "Undergraduate",
    credits: 4,
    professor: "Prof. Michael Chen",
    schedule: "Tue, Thu • 11:00 AM - 12:30 PM",
    location: "Engineering Building, Room 305",
    enrolled: 75,
    capacity: 80,
    rating: 4.7,
    reviewCount: 94,
    description:
      "Study of fundamental data structures and algorithms. Includes arrays, linked lists, trees, graphs, sorting, searching, and algorithm analysis.",
    genEd: ["Quantitative Reasoning"],
    prerequisites: ["CS 101"],
  },
  {
    courseID: "MATH201",
    serialNumber: "MATH 201",
    title: "Calculus II",
    department: "Mathematics",
    level: "Undergraduate",
    credits: 4,
    professor: "Dr. Emily Rodriguez",
    schedule: "Mon, Wed, Fri • 1:00 PM - 2:15 PM",
    location: "Science Hall, Room 150",
    enrolled: 85,
    capacity: 100,
    rating: 3.9,
    reviewCount: 76,
    description:
      "Continuation of Calculus I. Topics include integration techniques, applications of integration, sequences and parametric equations.",
    genEd: [],
    prerequisites: ["MATH 101"],
  },
  {
    courseID: "PHYS101",
    serialNumber: "PHYS 101",
    title: "General Physics I",
    department: "Physics",
    level: "Undergraduate",
    credits: 4,
    professor: "Prof. David Anderson",
    schedule: "Tue, Thu • 2:00 PM - 3:30 PM",
    location: "Physics Building, Room 101",
    enrolled: 72,
    capacity: 90,
    rating: 4.1,
    reviewCount: 68,
    description:
      "Introduction to classical mechanics. Topics include kinematics, dynamics, energy, and rotational motion.",
    genEd: ["Natural Science"],
    prerequisites: [],
  },
  {
    courseID: "ENG301",
    serialNumber: "ENG 301",
    title: "Technical Writing",
    department: "English",
    level: "Undergraduate",
    credits: 3,
    professor: "Dr. Laura Kim",
    schedule: "Mon, Wed • 10:00 AM - 11:30 AM",
    location: "Humanities Building, Room 202",
    enrolled: 30,
    capacity: 35,
    rating: 4.3,
    reviewCount: 55,
    description:
      "Develops writing skills for technical and professional contexts. Covers reports, documentation, and presentation.",
    genEd: ["Communication"],
    prerequisites: [],
  },
  {
    courseID: "CS350",
    serialNumber: "CS 350",
    title: "Software Engineering",
    department: "Computer Science",
    level: "Undergraduate",
    credits: 3,
    professor: "Prof. James Wu",
    schedule: "Tue, Thu • 9:00 AM - 10:30 AM",
    location: "Engineering Building, Room 410",
    enrolled: 60,
    capacity: 65,
    rating: 4.6,
    reviewCount: 88,
    description:
      "Principles and practices of software engineering including design patterns, testing, and agile methodology.",
    genEd: [],
    prerequisites: ["CS 202"],
  },
];

const DEPARTMENTS = ["All Departments", "Computer Science", "Mathematics", "Physics", "English"];
const GEN_ED_CATEGORIES = ["All Categories", "Quantitative Reasoning", "Natural Science", "Communication"];
const CREDIT_OPTIONS = ["All Credits", "3 Credits", "4 Credits"];
const LEVEL_OPTIONS = ["All Levels", "Undergraduate", "Graduate"];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
      <Star size={14} className="fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

export default function CourseCatalog() {
  const { user } = useAuth();
  const { addToSchedule, isScheduled } = useSchedule();

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [genEd, setGenEd] = useState("All Categories");
  const [credits, setCredits] = useState("All Credits");
  const [level, setLevel] = useState("All Levels");
  const [showFilters, setShowFilters] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);

  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loadingBookmark, setLoadingBookmark] = useState<Record<string, boolean>>({});

  // 初始化每堂課的收藏狀態
  useEffect(() => {
    if (!user) return;
    mockCourses.forEach(async (course) => {
      try {
        const res = await isBookmarked(user.id, course.courseID);
        setBookmarked((prev) => ({ ...prev, [course.courseID]: res.isBookmarked }));
      } catch {
        // ignore
      }
    });
  }, [user]);

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

  const filtered = useMemo(() => {
    return mockCourses.filter((c) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.professor.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      const matchDept = department === "All Departments" || c.department === department;
      const matchGenEd = genEd === "All Categories" || c.genEd.includes(genEd);
      const matchCredits = credits === "All Credits" || c.credits === parseInt(credits);
      const matchLevel = level === "All Levels" || c.level === level;
      const matchSaved = !savedOnly || !!bookmarked[c.courseID];
      return matchQuery && matchDept && matchGenEd && matchCredits && matchLevel && matchSaved;
    });
  }, [query, department, genEd, credits, level, savedOnly, bookmarked]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Find Your Perfect Courses
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Explore {mockCourses.length} courses for Spring 2026. Search by keyword, filter by
          department, or browse general education requirements.
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
              placeholder="Search by course name, code, instructor, or keywords..."
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
            {savedOnly
              ? <BookmarkCheck size={15} className="text-rose-500" />
              : <Bookmark size={15} />}
            Saved Courses
          </button>

          {/* Advanced Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal size={15} />
            Advanced Filters
          </button>

          {showFilters && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
              {(
                [
                  { label: "Department", value: department, setter: setDepartment, options: DEPARTMENTS },
                  { label: "General Education", value: genEd, setter: setGenEd, options: GEN_ED_CATEGORIES },
                  { label: "Credits", value: credits, setter: setCredits, options: CREDIT_OPTIONS },
                  { label: "Level", value: level, setter: setLevel, options: LEVEL_OPTIONS },
                ] as const
              ).map((filter) => (
                <div key={filter.label} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {filter.label}
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={filter.value}
                      onChange={(e) => filter.setter(e.target.value as any)}
                    >
                      {filter.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-xl font-bold text-slate-800">
        {filtered.length} Course{filtered.length !== 1 ? "s" : ""} Found
        {savedOnly && <span className="ml-2 text-sm font-normal text-rose-500">（已收藏）</span>}
      </p>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-card p-12 text-center text-muted-foreground">
          {savedOnly ? "你還沒有收藏任何課程。" : "No courses match your search."}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 items-start">
          {filtered.map((course) => {
            const spots = course.capacity - course.enrolled;
            const isAlmostFull = spots <= 10;
            const isSaved = !!bookmarked[course.courseID];
            return (
              <div key={course.courseID}>
                <Link to={`/courses/${course.courseID}`} className="block group">
                  <Card className="overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-slate-200">
                    <CardContent className="p-6 space-y-4">
                      {/* Top row: 課號+評分  |  學分+收藏 */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-slate-700">
                              {course.serialNumber}
                            </span>
                            <StarRating rating={course.rating} />
                            <span className="text-xs text-muted-foreground">
                              ({course.reviewCount})
                            </span>
                          </div>
                          <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                            {course.title}
                          </h2>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className="bg-primary text-primary-foreground text-xs whitespace-nowrap">
                            {course.credits} Credits
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {course.level}
                          </span>
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
                            {isSaved
                              ? <BookmarkCheck size={18} />
                              : <Bookmark size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="shrink-0" />
                          <span>{course.professor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="shrink-0" />
                          <span>{course.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0" />
                          <span>{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="shrink-0" />
                          <span className={isAlmostFull ? "font-semibold text-rose-500" : ""}>
                            {course.enrolled}/{course.capacity} enrolled ({spots} spots left)
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>

                      {/* Gen Ed */}
                      {course.genEd.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                          <span className="text-muted-foreground">Gen Ed:</span>
                          {course.genEd.map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Add to Schedule */}
                      <div
                        className="pt-1"
                        onClick={(e) => {
                          e.preventDefault();
                          const { days, timeSlot } = parseSchedule(course.schedule);
                          addToSchedule({
                            courseID: course.courseID,
                            serialNumber: course.serialNumber,
                            title: course.title,
                            department: course.department,
                            credits: course.credits,
                            professor: course.professor,
                            schedule: course.schedule,
                            location: course.location,
                            days,
                            timeSlot,
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
                          {isScheduled(course.courseID) ? "✓ Added to Schedule" : "Add to Schedule"}
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
    </div>
  );
}
