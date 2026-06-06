import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface ScheduledCourse {
  courseID: string;
  serialNumber: string;
  title: string;
  department: string;
  credits: number;
  professor: string;
  schedule: string;
  location: string;
  days: string[];
  timeSlot: string;
}

interface ScheduleContextType {
  scheduled: ScheduledCourse[];
  addToSchedule: (course: ScheduledCourse) => void;
  removeFromSchedule: (courseID: string) => void;
  isScheduled: (courseID: string) => boolean;
}

const STORAGE_KEY = "mySchedule";

function loadFromStorage(): ScheduledCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(courses: ScheduledCourse[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); } catch {}
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
  const [scheduled, setScheduled] = useState<ScheduledCourse[]>(loadFromStorage);

  // 每次 scheduled 變動時同步到 localStorage
  useEffect(() => {
    saveToStorage(scheduled);
  }, [scheduled]);

  const addToSchedule = (course: ScheduledCourse) => {
    setScheduled((prev) =>
      prev.find((c) => c.courseID === course.courseID) ? prev : [...prev, course]
    );
  };

  const removeFromSchedule = (courseID: string) => {
    setScheduled((prev) => prev.filter((c) => c.courseID !== courseID));
  };

  const isScheduled = (courseID: string) =>
    scheduled.some((c) => c.courseID === courseID);

  return (
    <ScheduleContext.Provider value={{ scheduled, addToSchedule, removeFromSchedule, isScheduled }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
