from models.schedule import ScheduledCourse


class ScheduleService:
    def __init__(self, schedule_repo, student_repo, course_repo):
        self.schedule_repo = schedule_repo
        self.student_repo = student_repo
        self.course_repo = course_repo

    def get_schedule(self, student_id):
        self._require_student(student_id)
        return self.schedule_repo.find_by_user(student_id)

    def add_course(self, student_id, course_snapshot):
        self._require_student(student_id)
        scheduled_course = ScheduledCourse.from_course_snapshot(
            student_id,
            course_snapshot or {},
        )
        self._require_course(scheduled_course.courseId)
        return self.schedule_repo.upsert(scheduled_course)

    def replace_schedule(self, student_id, course_snapshots):
        self._require_student(student_id)
        if not isinstance(course_snapshots, list):
            raise ValueError("courses must be a list.")
        courses = []
        seen_course_ids = set()
        for snapshot in course_snapshots:
            scheduled_course = ScheduledCourse.from_course_snapshot(student_id, snapshot or {})
            if scheduled_course.courseId in seen_course_ids:
                continue
            self._require_course(scheduled_course.courseId)
            seen_course_ids.add(scheduled_course.courseId)
            courses.append(scheduled_course)
        return self.schedule_repo.replace_for_user(student_id, courses)

    def remove_course(self, student_id, course_id):
        self._require_student(student_id)
        if not self.schedule_repo.delete(student_id, course_id):
            raise ValueError("Scheduled course not found.")

    def is_scheduled(self, student_id, course_id):
        self._require_student(student_id)
        return self.schedule_repo.find_by_user_and_course(student_id, course_id) is not None

    def _require_student(self, student_id):
        if not self.student_repo.find_by_id(student_id):
            raise ValueError("Student not found.")

    def _require_course(self, course_id):
        if not self.course_repo.find_by_id(course_id):
            raise ValueError("Course not found.")
