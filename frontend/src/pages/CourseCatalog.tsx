import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

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
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [genEd, setGenEd] = useState("All Categories");
  const [credits, setCredits] = useState("All Credits");
  const [level, setLevel] = useState("All Levels");
  const [showFilters, setShowFilters] = useState(true);

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
      return matchQuery && matchDept && matchGenEd && matchCredits && matchLevel;
    });
  }, [query, department, genEd, credits, level]);

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
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              className="pl-10 h-11 text-base"
              placeholder="Search by course name, code, instructor, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

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
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      </p>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          No courses match your search.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((course) => {
            const spots = course.capacity - course.enrolled;
            const isAlmostFull = spots <= 10;
            return (
              <Link
                key={course.courseID}
                to={`/courses/${course.courseID}`}
                className="block group"
              >
                <Card className="overflow-hidden shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30">
                  <CardContent className="p-6 space-y-4">
                    {/* Top */}
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
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className="bg-primary text-primary-foreground text-xs whitespace-nowrap">
                          {course.credits} Credits
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          {course.level}
                        </span>
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

                    {/* Add to Schedule — stop propagation so clicking it doesn't navigate */}
                    <div className="pt-1" onClick={(e) => e.preventDefault()}>
                      <Button className="w-full font-semibold" size="sm">
                        Add to Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
