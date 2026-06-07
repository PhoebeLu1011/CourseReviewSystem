const COMPOSITE_COURSE_ID_PATTERN = /^(.+)_\d{2,3}_[12]$/;

export function formatCourseDisplayCode(courseID: string) {
  const match = courseID.match(COMPOSITE_COURSE_ID_PATTERN);
  return match ? match[1] : courseID;
}

export function cleanCourseTitle(title?: string | null) {
  return (title || "").split(/<\/?br\s*\/?>/i)[0].trim();
}
