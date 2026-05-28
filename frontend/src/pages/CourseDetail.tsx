import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  MapPin,
  Users,
  Star,
  Flag,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  PenLine,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { addBookmark, removeBookmark, isBookmarked } from "../api/bookmarkApi";
import { useSchedule, parseSchedule } from "../context/ScheduleContext";

// ─── Types ───────────────────────────────────────────────────
interface CourseDetail {
  courseID: string;
  serialNumber: string;
  title: string;
  department: string;
  level: string;
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
  // Syllabus
  overview: string;
  learningObjectives: string[];
  topics: string[];
  gradingPolicy: { label: string; pct: number }[];
  textbooks: string[];
}

interface Review {
  reviewID: string;
  author: string;
  semester: string;
  date: string;
  rating: number;
  content: string;
  difficulty: number;
  workload: number;
  recommends: boolean;
  helpfulCount: number;
}

interface Discussion {
  discussionID: string;
  title: string;
  author: string;
  date: string;
  likes: number;
  content: string;
  tags: string[];
  replyCount: number;
  latestReply: { author: string; date: string; content: string } | null;
}

// ─── Mock Data ───────────────────────────────────────────────
const mockCourseDetails: Record<string, CourseDetail> = {
  CS101: {
    courseID: "CS101",
    serialNumber: "CS 101",
    title: "Introduction to Computer Science",
    department: "Computer Science",
    level: "Undergraduate",
    credits: 4,
    professor: "Dr. Sarah Johnson",
    schedule: "Mon, Wed, Fri",
    location: "Engineering Building, Room 201",
    enrolled: 98,
    capacity: 120,
    rating: 4.5,
    reviewCount: 127,
    description:
      "An introduction to the intellectual enterprises of computer science and the art of programming. Topics include abstraction, algorithms, data structures, and software engineering.",
    genEd: ["Quantitative Reasoning"],
    prerequisites: [],
    overview:
      "This course provides a comprehensive introduction to computer science and programming. Students will learn fundamental concepts including problem-solving, abstraction, algorithms, and data structures through hands-on coding projects.",
    learningObjectives: [
      "Understand fundamental programming concepts and constructs",
      "Design and implement algorithms to solve computational problems",
      "Apply abstraction and decomposition to manage complexity",
      "Develop debugging and testing strategies",
      "Collaborate effectively on software projects",
    ],
    topics: [
      "Introduction to Programming and Python",
      "Variables, Data Types, and Operators",
      "Control Flow and Conditionals",
      "Functions and Modular Design",
      "Data Structures: Lists, Dictionaries, Sets",
      "Object-Oriented Programming Basics",
      "File I/O and Exception Handling",
      "Algorithm Analysis and Complexity",
      "Recursion",
      "Final Project Development",
    ],
    gradingPolicy: [
      { label: "Assignments", pct: 40 },
      { label: "Midterm Exam", pct: 20 },
      { label: "Final Exam", pct: 30 },
      { label: "Participation", pct: 10 },
    ],
    textbooks: [
      "Introduction to Python Programming by John Zelle",
      "Think Python: How to Think Like a Computer Scientist by Allen Downey",
    ],
  },
};

const mockReviews: Record<string, Review[]> = {
  CS101: [
    {
      reviewID: "r001",
      author: "Emma Larsen",
      semester: "Fall 2025",
      date: "2025/12/15",
      rating: 5,
      content:
        "Excellent introduction to programming! Dr. Johnson explains concepts clearly and the assignments are challenging but fair. Really helped me build a strong foundation.",
      difficulty: 3,
      workload: 4,
      recommends: true,
      helpfulCount: 24,
    },
    {
      reviewID: "r002",
      author: "Magnus Berg",
      semester: "Fall 2025",
      date: "2025/12/10",
      rating: 4,
      content:
        "Great course but be prepared to spend a lot of time on the projects. The workload is heavy, especially toward the end of the semester.",
      difficulty: 4,
      workload: 5,
      recommends: true,
      helpfulCount: 18,
    },
  ],
};

const mockDiscussions: Record<string, Discussion[]> = {
  CS101: [
    {
      discussionID: "d001",
      title: "Tips for the final project?",
      author: "Erik Pedersen",
      date: "2026/4/9",
      likes: 15,
      content:
        "Hey everyone! I'm starting to think about the final project. For those who took this last semester, any advice on choosing a topic? I'm torn between a game and a web app.",
      tags: ["project", "advice"],
      replyCount: 2,
      latestReply: {
        author: "Thomas Eriksen",
        date: "2026/4/11",
        content:
          "Web app is a solid choice - you can show it off easily and it looks good on your portfolio. Plus, Dr. Johnson has more resources for web debugging.",
      },
    },
    {
      discussionID: "d002",
      title: "How do you approach debugging?",
      author: "Ida Johansen",
      date: "2026/4/16",
      likes: 23,
      content:
        "I keep getting stuck on bugs and spend hours trying to figure them out. What strategies do you all use when debugging your code? Any tips for a beginner?",
      tags: ["advice", "debugging"],
      replyCount: 3,
      latestReply: {
        author: "Ole Kristensen",
        date: "2026/4/17",
        content:
          "Also, try explaining your code to someone else (or a rubber duck!). Often just talking through the logic helps you spot the bug yourself.",
      },
    },
  ],
};

// ─── Helper Components ────────────────────────────────────────
function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </span>
  );
}

function DotRating({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            i < value ? color : "bg-slate-200"
          }`}
        />
      ))}
    </span>
  );
}

function ProgressBar({ pct, color = "bg-primary" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ course }: { course: CourseDetail }) {
  const spots = course.capacity - course.enrolled;
  const enrollPct = Math.round((course.enrolled / course.capacity) * 100);
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Course Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <BookOpen size={15} /> Instructor
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.professor}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Calendar size={15} /> Schedule
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.schedule}</p>
            <p className="text-sm text-muted-foreground pl-5">9:00 AM - 10:15 AM</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <MapPin size={15} /> Location
            </div>
            <p className="text-sm text-muted-foreground pl-5">{course.location}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Users size={15} /> Enrollment
            </div>
            <p className="text-sm text-muted-foreground pl-5">
              {course.enrolled} / {course.capacity} students ({spots} spots left)
            </p>
            <div className="pl-5 w-48">
              <ProgressBar pct={enrollPct} />
            </div>
          </div>
        </div>

        {course.genEd.length > 0 && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-base font-bold text-slate-800 mb-3">
              General Education Requirements
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.genEd.map((g) => (
                <Badge key={g} variant="outline" className="text-sm">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Syllabus Tab ─────────────────────────────────────────────
function SyllabusTab({ course }: { course: CourseDetail }) {
  return (
    <div className="space-y-5">
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-slate-800 mb-3">Course Overview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{course.overview}</p>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {course.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                {obj}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Course Topics</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {course.topics.map((topic, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="shrink-0 font-semibold text-slate-500 w-5">{i + 1}</span>
                {topic}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Grading Policy</h3>
            {course.gradingPolicy.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.pct}%</span>
                </div>
                <ProgressBar pct={item.pct} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-800">Required Textbooks</h3>
            <ul className="space-y-2">
              {course.textbooks.map((book, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-primary" />
                  {book}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Reviews Tab ─────────────────────────────────────────────
function ReviewsTab({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const recommendPct = total > 0
    ? Math.round((reviews.filter((r) => r.recommends).length / total) * 100)
    : 0;
  const avgDifficulty = total > 0
    ? (reviews.reduce((s, r) => s + r.difficulty, 0) / total).toFixed(1)
    : "0";
  const avgWorkload = total > 0
    ? (reviews.reduce((s, r) => s + r.workload, 0) / total).toFixed(1)
    : "0";

  // Distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="gap-2" size="sm">
          <PenLine size={15} /> Write a Review
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Rating Summary */}
        <Card className="lg:col-span-1 border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-800">Rating Summary</h3>

            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl font-extrabold text-primary">{avg.toFixed(1)}</span>
              <Stars rating={avg} />
              <span className="text-xs text-muted-foreground">Based on {total} review{total !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rating Distribution
              </p>
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-0.5 w-8 text-amber-500 font-semibold">
                    {d.star} <Star size={10} className="fill-amber-400" />
                  </span>
                  <div className="flex-1">
                    <ProgressBar pct={d.pct} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{d.pct}%</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-bold">{avgDifficulty}/5</span>
                </div>
                <ProgressBar pct={(parseFloat(avgDifficulty) / 5) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Workload</span>
                  <span className="font-bold">{avgWorkload}/5</span>
                </div>
                <ProgressBar pct={(parseFloat(avgWorkload) / 5) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Would Recommend</span>
                  <span className="font-bold">{recommendPct}%</span>
                </div>
                <ProgressBar pct={recommendPct} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Student Reviews</h3>
            <span className="text-sm text-muted-foreground">{total} total</span>
          </div>

          {reviews.map((review) => (
            <Card key={review.reviewID} className="border-slate-100 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{review.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.semester} • {review.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <Stars rating={review.rating} />
                      <span className="text-xs font-bold text-primary">
                        {review.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                    <button className="text-muted-foreground hover:text-rose-500 transition-colors">
                      <Flag size={15} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.content}
                </p>

                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    Difficulty:
                    <DotRating value={review.difficulty} color="bg-rose-400" />
                    <span className="font-semibold">{review.difficulty}/5</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    Workload:
                    <DotRating value={review.workload} color="bg-blue-400" />
                    <span className="font-semibold">{review.workload}/5</span>
                  </span>
                  {review.recommends && (
                    <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 font-medium">
                      <CheckCircle2 size={11} className="text-primary" /> Recommends
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    <ThumbsUp size={12} /> {review.helpfulCount} helpful
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-card p-8 text-center text-muted-foreground text-sm">
              No reviews yet. Be the first to write one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Discussions Tab ──────────────────────────────────────────
function DiscussionsTab({ discussions, courseID }: { discussions: Discussion[]; courseID: string }) {
  return (
    <div className="space-y-4">
      {discussions.map((d) => (
        <Card key={d.discussionID} className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800">{d.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {d.author} • {d.date}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <ThumbsUp size={14} /> {d.likes}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{d.content}</p>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                {d.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link
                to={`/courses/${courseID}/discussions/${d.discussionID}`}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <MessageSquare size={14} /> {d.replyCount} Replies
              </Link>
            </div>

            {d.latestReply && (
              <div className="rounded-lg bg-muted/50 px-4 py-3 space-y-1 border-l-2 border-primary/30">
                <p className="text-xs font-semibold text-muted-foreground">Latest Reply</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-slate-700">{d.latestReply.author}</span>
                  <span className="text-xs text-muted-foreground">{d.latestReply.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {d.latestReply.content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {discussions.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
          No discussions yet. Start the conversation!
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function CourseDetail() {
  const { courseID } = useParams<{ courseID: string }>();
  const { user } = useAuth();
  const { addToSchedule, isScheduled } = useSchedule();

  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const course = courseID ? mockCourseDetails[courseID] : null;
  const reviews = courseID ? (mockReviews[courseID] ?? []) : [];
  const discussions = courseID ? (mockDiscussions[courseID] ?? []) : [];

  useEffect(() => {
    if (!user || !courseID) return;
    isBookmarked(user.id, courseID)
      .then((res) => setIsSaved(res.isBookmarked))
      .catch(() => {});
  }, [user, courseID]);

  const handleBookmark = async () => {
    if (!user) return alert("請先登入");
    setLoadingSave(true);
    try {
      if (isSaved) {
        await removeBookmark(user.id, courseID!);
        setIsSaved(false);
      } else {
        await addBookmark(user.id, { courseId: courseID! });
        setIsSaved(true);
      }
    } catch {
      alert("操作失敗，請稍後再試");
    } finally {
      setLoadingSave(false);
    }
  };

  if (!course) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-xl font-semibold text-slate-700">Course not found.</p>
        <Link to="/courses" className="text-primary hover:underline text-sm">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Back to Catalog
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{course.serialNumber}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{course.title}</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary text-primary-foreground">
              {course.credits} Credits
            </Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Badge variant="outline">{course.department}</Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({reviews.length} reviews)
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={loadingSave}
            onClick={handleBookmark}
            className={`rounded-full p-1.5 transition-colors ${
              isSaved
                ? "text-rose-500 hover:text-rose-600"
                : "text-muted-foreground hover:text-rose-400"
            }`}
            title={isSaved ? "取消收藏" : "收藏"}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <Button
            className={`font-semibold transition-colors ${
              course && isScheduled(course.courseID)
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : ""
            }`}
            onClick={() => {
              if (!course) return;
              const { days, timeSlot } = parseSchedule(`${course.schedule} • 9:00 AM - 10:15 AM`);
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
            {course && isScheduled(course.courseID) ? "✓ Added" : "Add to Schedule"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="overview" className="flex-1 rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="flex-1 rounded-lg">
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-lg">
            Reviews{reviews.length > 0 && ` ${reviews.length}`}
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex-1 rounded-lg">
            Discussions{discussions.length > 0 && ` ${discussions.length}`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <OverviewTab course={course} />
        </TabsContent>

        <TabsContent value="syllabus" className="mt-5">
          <SyllabusTab course={course} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-5">
          <ReviewsTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="discussions" className="mt-5">
          <DiscussionsTab discussions={discussions} courseID={course.courseID} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-8 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">NTNU Course Selection Toolbox</p>
        <p>Spring 2026 • Academic Year 2025-2026</p>
      </footer>
    </div>
  );
}
