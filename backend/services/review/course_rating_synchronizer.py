class CourseRatingSynchronizer:
    """Observer-style collaborator that projects review changes onto a course."""

    def __init__(self, course_repo, review_repo):
        self.course_repo = course_repo
        self.review_repo = review_repo

    def review_changed(self, course_id: str) -> None:
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")

        average_sweetness, average_workload, review_count = (
            self.review_repo.calc_course_averages(course_id)
        )
        course.averageSweetness = round(average_sweetness, 2)
        course.averageWorkload = round(average_workload, 2)
        course.reviewCount = review_count
        self.course_repo.save(course)
