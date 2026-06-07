import type { Course } from "../../api/courseApi";

export const ALL_COURSES_ID = "all";
export const ALL_DEPARTMENTS_ID = "all";
export const ALL_STUDY_STYLES_ID = "all";
export const ALL_MEETING_PREFERENCES_ID = "all";
export const COURSE_OPTION_LIMIT = 100;

export type GroupmateOption = {
  value: string;
  label: string;
};

export const studyStyleOptions: GroupmateOption[] = [
  { value: ALL_STUDY_STYLES_ID, label: "全部風格" },
  { value: "group", label: "小組討論" },
  { value: "pair", label: "兩人讀書" },
  { value: "flexible", label: "彈性配合" },
];

export const createStudyStyleOptions = studyStyleOptions.filter(
  (option) => option.value !== ALL_STUDY_STYLES_ID
);

export const meetingPreferenceOptions: GroupmateOption[] = [
  { value: ALL_MEETING_PREFERENCES_ID, label: "全部偏好" },
  { value: "online", label: "線上" },
  { value: "in-person", label: "實體見面" },
  { value: "hybrid", label: "線上＋實體" },
];

export const createMeetingPreferenceOptions = meetingPreferenceOptions.filter(
  (option) => option.value !== ALL_MEETING_PREFERENCES_ID
);

const tagLabelMap = new Map(
  [...studyStyleOptions, ...meetingPreferenceOptions].map((option) => [
    option.value.toLowerCase(),
    option.label,
  ])
);

export const formatGroupTagLabel = (tag: string) =>
  tagLabelMap.get(tag.toLowerCase()) || tag;

export const formatGroupName = (name: string) => {
  const match = name.match(/^(.+)'s Groupmate Post$/);
  if (!match) return name;
  const owner = match[1] === "Student" ? "同學" : match[1];
  return `${owner}的揪人貼文`;
};

export const cleanCourseTitle = (title?: string | null) => {
  return (title || "").split(/<\/?br\s*\/?>/i)[0].trim();
};

export const getCourseDisplayCode = (course?: Course, fallback = "") =>
  course?.courseCode || course?.serialNumber || fallback;

export const formatCourseLabel = (course?: Course, fallback = "") => {
  const code = getCourseDisplayCode(course, fallback);
  const title = cleanCourseTitle(course?.title);
  return title && title !== code ? `${code}: ${title}` : code;
};
