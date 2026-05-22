from repository.course_repository import CourseRepository

class CourseService:
    def __init__(self, course_repo: CourseRepository):
        self.course_repo = course_repo

    def get_course(self, course_id: str):
        """Fetch a specific course details for the frontend."""
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")
        return course.to_dict()

    def search_courses(self, query: str, limit=20, skip=0):
        """Search engine for the course list view."""
        courses = self.course_repo.search_courses(query, limit, skip)
        return [c.to_dict() for c in courses]

    def update_course_ratings(self, course_id: str, new_sweetness: float, new_workload: float):
        """
        Triggered whenever a student leaves a brand new review.
        Updates the averages running incrementally.
        """
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found to update scores.")

        # Increment total count of reviews
        course.reviewCount += 1

        # Incremental moving average formula
        course.averageSweetness += (new_sweetness - course.averageSweetness) / course.reviewCount
        course.averageWorkload += (new_workload - course.averageWorkload) / course.reviewCount

        # Save changes back to MongoDB
        self.course_repo.save(course)
        return course.to_dict()