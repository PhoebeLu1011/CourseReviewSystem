from repository.review_repository import ReviewRepository
from repository.student_repository import StudentRepository
from models.review import Review


class ReviewService:
    def __init__(self, review_repo: ReviewRepository, student_repo: StudentRepository, course_service):
        self.review_repo = review_repo
        self.student_repo = student_repo
        self.course_service = course_service

    def create_review(self, student_id, course_id, content, sweetness, workload):
        if self.review_repo.has_user_reviewed_course(student_id, course_id):
            raise ValueError(f"You have already submitted a review for course {course_id}.")

        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found. Please log in again.")

        student.reviewCount += 1
        self.student_repo.save(student)

        course = self.course_service.course_repo.find_by_id(course_id)
        course_name = course.title if course else ""

        new_review = Review(
            authorID=student_id,
            courseID=course_id,
            courseName=course_name,
            content=content,
            sweetnessScore=sweetness,
            workloadScore=workload
        )

        self.review_repo.save(new_review)
        self._sync_course_ratings(course_id)

        return new_review.to_dict()

    def handle_like(self, review_id, student_id):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")

        review.toggle_like(student_id)

        self.review_repo.save(review)
        return review.likeCount

    def get_reviews_by_course(self, course_id, sort_by="newest", limit=10, skip=0):
        return self.review_repo.find_by_course_id(course_id, sort_by, limit, skip)

    def get_all_reviews(self, search_query="", sort_by="newest", limit=20, skip=0):
        return self.review_repo.find_all_reviews(search_query, sort_by, limit, skip)

    def get_reviews_by_student(self, student_id):
        return self.review_repo.find_visible_by_student(student_id)

    def update_review(self, review_id, student_id, content, sweetness, workload):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        if review.authorID != student_id:
            raise ValueError("Unauthorized to edit this review.")

        review.content = content
        review.sweetnessScore = sweetness
        review.workloadScore = workload

        self.review_repo.save(review)
        self._sync_course_ratings(review.courseID)

        return review.to_dict()

    def delete_review(self, review_id, student_id):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        if review.authorID != student_id:
            raise ValueError("Unauthorized to delete this review.")

        course_id = review.courseID

        self.review_repo.delete_by_id(review_id)

        student = self.student_repo.find_by_id(student_id)
        if student and student.reviewCount > 0:
            student.reviewCount -= 1
            self.student_repo.save(student)

        self._sync_course_ratings(course_id)

        return True

    def _sync_course_ratings(self, course_id):
        """Recalculate course ratings through the repository boundary."""
        try:
            self.course_service.recalculate_course_ratings(
                course_id,
                self.review_repo,
            )
        except Exception as e:
            print(f"Warning: Could not sync course ratings: {e}")
