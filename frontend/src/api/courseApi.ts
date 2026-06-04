import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export interface Course {
  courseID: string;        // composite: {serialNumber}_{year}_{semester}
  courseCode: string;      // original code e.g. TAC8001
  serialNumber: string;
  title: string;
  department: string;
  professors: string[];
  timeAndLocation: string;
  syllabusURL: string;
  academicYear: string;
  semester: string;
  credits: number;
  capacity: number;
  level: string;
  averageSweetness: number;
  averageWorkload: number;
  reviewCount: number;
}

export const LEVELS = ["學士班", "碩士班", "博士班", "其他"] as const;
export const SEMESTERS: { value: string; label: string }[] = [
  { value: "1", label: "第一學期" },
  { value: "2", label: "第二學期" },
];

export interface SearchResult {
  courses: Course[];
  total: number;
}

export async function searchCourses(
  query = "",
  department = "",
  level = "",
  semester = "",
  academicYear = "",
  limit = 20,
  skip = 0
): Promise<SearchResult> {
  const params = new URLSearchParams();
  if (query)        params.set("q", query);
  if (department)   params.set("department", department);
  if (level)        params.set("level", level);
  if (semester)     params.set("semester", semester);
  if (academicYear) params.set("academicYear", academicYear);
  params.set("limit", String(limit));
  params.set("skip", String(skip));

  const res = await fetch(`${BASE_URL}/courses/search?${params}`);
  if (!res.ok) throw new Error("Failed to search courses");
  return res.json();
}

export async function getAcademicYears(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/courses/years`);
  if (!res.ok) throw new Error("Failed to fetch academic years");
  return res.json();
}

export async function getCourse(courseID: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/courses/${courseID}`);
  if (!res.ok) throw new Error("Course not found");
  return res.json();
}

export async function getDepartments(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/courses/departments`);
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

/** Parse NTNU timeAndLocation into English-style schedule and location strings.
 *
 * Input examples:
 *   "一 6-8 校外 教室自排"
 *   "三 2-4 人文樓 202"
 *   "二 6-7 校外 教室自排, 四 6 校外 教室自排"
 */
export function parseNTNUSchedule(raw: string): { schedule: string; location: string; days: string[]; timeSlot: string } {
  const DAY_MAP: Record<string, string> = {
    一: "Mon", 二: "Tue", 三: "Wed", 四: "Thu", 五: "Fri", 六: "Sat",
  };

  const PERIOD_START: Record<string, string> = {
    "1": "08:10", "2": "09:10", "3": "10:10", "4": "11:10",
    "5": "12:10", "6": "13:10", "7": "14:10", "8": "15:10",
    "9": "16:10", "10": "17:10",
    A: "18:25", B: "19:20", C: "20:15", D: "21:10",
  };

  const PERIOD_END: Record<string, string> = {
    "1": "09:00", "2": "10:00", "3": "11:00", "4": "12:00",
    "5": "13:00", "6": "14:00", "7": "15:00", "8": "16:00",
    "9": "17:00", "10": "18:00",
    A: "19:15", B: "20:10", C: "21:05", D: "22:00",
  };

  if (!raw || raw.trim() === "") {
    return { schedule: "TBA", location: "TBA", days: [], timeSlot: "" };
  }

  // Split multiple sessions by ", " and process each
  const sessions = raw.split(/,\s*(?=[一二三四五六])/);

  const daySet = new Set<string>();
  const timeRanges: string[] = [];
  const locations: string[] = [];

  for (const session of sessions) {
    const trimmed = session.trim();
    // Pattern: {day_char} {period_or_range} {rest...}
    const match = trimmed.match(/^([一二三四五六])\s+([\dA-D](?:-[\dA-D])?)\s*(.*)$/i);
    if (!match) continue;

    const [, dayChar, periodPart, locationPart] = match;
    const engDay = DAY_MAP[dayChar] ?? dayChar;
    daySet.add(engDay);

    // Parse period range like "6-8" or single "3"
    const periodMatch = periodPart.match(/^([\dA-D])(?:-([\dA-D]))?$/i);
    if (periodMatch) {
      const startPeriod = periodMatch[1].toUpperCase();
      const endPeriod = (periodMatch[2] ?? periodMatch[1]).toUpperCase();
      const start = PERIOD_START[startPeriod] ?? "";
      const end = PERIOD_END[endPeriod] ?? "";
      if (start && end) timeRanges.push(`${start}–${end}`);
    }

    const loc = locationPart.trim();
    if (loc && !locations.includes(loc)) locations.push(loc);
  }

  const days = [...daySet];
  const timeSlot = timeRanges[0] ?? "";
  const schedule = days.length > 0
    ? `${days.join(", ")} • ${timeSlot || raw}`
    : raw;
  const location = locations.join(" / ") || "TBA";

  return { schedule, location, days, timeSlot };
}
