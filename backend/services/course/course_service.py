from repository.course_repository import CourseRepository
from models.course import CourseSearchCriteria


class CourseService:
    def __init__(self, course_repo: CourseRepository):
        self.course_repo = course_repo

    def get_course(self, course_id: str):
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")
        return course.to_dict()

    def search_courses(self, query: str, limit=20, skip=0,
                       department=None, level=None, semester=None, academicYear=None):
        criteria = self._criteria(
            query, limit, skip, department, level, semester, academicYear
        )
        courses = self.course_repo.search_courses(criteria)
        return [c.to_dict() for c in courses]

    def get_departments(self):
        return self.course_repo.get_departments()

    def get_academic_years(self):
        return self.course_repo.get_academic_years()

    def count_courses(self, query: str, department=None, level=None,
                      semester=None, academicYear=None):
        criteria = self._criteria(
            query, 20, 0, department, level, semester, academicYear
        )
        return self.course_repo.count_courses(criteria)

    @staticmethod
    def _criteria(query, limit, skip, department, level, semester, academic_year):
        return CourseSearchCriteria(
            query=query,
            department=department,
            level=level,
            semester=semester,
            academic_year=academic_year,
            limit=limit,
            skip=skip,
        )
