import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import {
  addScheduledCourse,
  getSchedule,
  removeScheduledCourse,
  replaceSchedule,
  type ScheduledCourse,
} from "../api/scheduleApi";
import { useAuth } from "./AuthContext";

export type { ScheduledCourse } from "../api/scheduleApi";

interface ScheduleContextType {
  scheduled: ScheduledCourse[];
  addToSchedule: (course: ScheduledCourse) => void;
  removeFromSchedule: (courseID: string) => void;
  isScheduled: (courseID: string) => boolean;
  isSyncing: boolean;
}

const STORAGE_KEY = "mySchedule";

function loadFromStorage(): ScheduledCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(courses: ScheduledCourse[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // Scheduling still works for the current session when storage is unavailable.
  }
}

function mergeSchedules(
  localCourses: ScheduledCourse[],
  remoteCourses: ScheduledCourse[],
) {
  return Array.from(
    new Map(
      [...remoteCourses, ...localCourses].map((course) => [course.courseID, course])
    ).values()
  );
}

function sameSchedule(a: ScheduledCourse[], b: ScheduledCourse[]) {
  const normalize = (courses: ScheduledCourse[]) =>
    JSON.stringify(
      courses
        .map((course) => course.courseID)
        .sort()
    );
  return normalize(a) === normalize(b);
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function parseSchedule(scheduleStr: string): { days: string[]; timeSlot: string } {
  const parts = scheduleStr.split(" • ");
  if (parts.length < 2) return { days: [], timeSlot: scheduleStr };
  const days = parts[0].split(", ").map((d) => d.trim());
  const timeSlot = parts[1].trim();
  return { days, timeSlot };
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState<ScheduledCourse[]>(loadFromStorage);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedStudentId, setSyncedStudentId] = useState<string | null>(null);

  // 每次 scheduled 變動時同步到 localStorage
  useEffect(() => {
    saveToStorage(scheduled);
  }, [scheduled]);

  useEffect(() => {
    let cancelled = false;
    const studentId = user?.role === "Student" ? user.id : null;
    if (!studentId) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setSyncedStudentId(null);
        setScheduled(loadFromStorage());
      });
      return;
    }

    Promise.resolve()
      .then(async () => {
        if (cancelled) return;
        setIsSyncing(true);
        const remoteCourses = await getSchedule(studentId);
        const merged = mergeSchedules(loadFromStorage(), remoteCourses);
        setScheduled(merged);
        if (!sameSchedule(remoteCourses, merged)) {
          await replaceSchedule(studentId, merged);
        }
        if (!cancelled) setSyncedStudentId(studentId);
      })
      .catch(() => {
        if (!cancelled) setSyncedStudentId(studentId);
      })
      .finally(() => {
        if (!cancelled) setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToSchedule = (course: ScheduledCourse) => {
    setScheduled((prev) =>
      prev.find((c) => c.courseID === course.courseID) ? prev : [...prev, course]
    );
    if (syncedStudentId) {
      void addScheduledCourse(syncedStudentId, course).catch(() => undefined);
    }
  };

  const removeFromSchedule = (courseID: string) => {
    setScheduled((prev) => prev.filter((c) => c.courseID !== courseID));
    if (syncedStudentId) {
      void removeScheduledCourse(syncedStudentId, courseID).catch(() => undefined);
    }
  };

  const isScheduled = (courseID: string) =>
    scheduled.some((c) => c.courseID === courseID);

  return (
    <ScheduleContext.Provider value={{ scheduled, addToSchedule, removeFromSchedule, isScheduled, isSyncing }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
