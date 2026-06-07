from copy import deepcopy

from models.review import Review
from repository.course_repository import CourseRepository
from repository.review_repository import ReviewRepository
from repository.student_repository import StudentRepository
from services.review.course_rating_synchronizer import CourseRatingSynchronizer


class ReviewService:
    """Coordinates review use cases across domain models and repositories."""

    def __init__(
        self,
        review_repo: ReviewRepository,
        student_repo: StudentRepository,
        course_repo: CourseRepository,
        rating_synchronizer: CourseRatingSynchronizer,
    ):
        self.review_repo = review_repo
        self.student_repo = student_repo
        self.course_repo = course_repo
        self.rating_synchronizer = rating_synchronizer

    def create_review(self, student_id, course_id, content, sweetness, workload):
        if self.review_repo.has_user_reviewed_course(student_id, course_id):
            raise ValueError(f"You have already submitted a review for course {course_id}.")

        student = self._get_student_or_raise(student_id)
        course = self._get_course_or_raise(course_id)
        review = Review(
            authorID=student_id,
            courseID=course.courseID,
            courseName=course.title,
            content=content,
            sweetnessScore=sweetness,
            workloadScore=workload,
        )

        self.review_repo.save(review)
        try:
            student.increment_review_count()
            self.student_repo.save(student)
            self.rating_synchronizer.review_changed(course.courseID)
        except Exception:
            self.review_repo.hard_delete_by_id(review.reviewID)
            student.decrement_review_count()
            self.student_repo.save(student)
            self.rating_synchronizer.review_changed(course.courseID)
            raise

        return review.to_dict()

    def handle_like(self, review_id, student_id):
        review = self._get_review_or_raise(review_id)
        review.toggle_like(student_id)
        self.review_repo.save(review)
        return review.likeCount

    def get_reviews_by_course(self, course_id, sort_by="newest", limit=10, skip=0):
        return self.review_repo.find_by_course_id(course_id, sort_by, limit, skip)

    def get_all_reviews(self, search_query="", sort_by="newest", department="", limit=20, skip=0):
        reviews = self.review_repo.find_all_reviews(search_query, sort_by, department, limit, skip)
        return [review.to_dict() for review in reviews]

    def get_reviews_by_student(self, student_id):
        return self.review_repo.find_visible_by_student(student_id)

    def update_review(self, review_id, student_id, content, sweetness, workload):
        review = self._get_owned_review_or_raise(review_id, student_id)
        original_review = deepcopy(review)

        review.update(content, sweetness, workload)
        self.review_repo.save(review)
        try:
            self.rating_synchronizer.review_changed(review.courseID)
        except Exception:
            self.review_repo.save(original_review)
            self.rating_synchronizer.review_changed(original_review.courseID)
            raise

        return review.to_dict()

    def delete_review(self, review_id, student_id):
        review = self._get_owned_review_or_raise(review_id, student_id)
        original_review = deepcopy(review)
        student = self._get_student_or_raise(student_id)
        original_review_count = student.reviewCount

        review.mark_deleted()
        self.review_repo.save(review)
        try:
            student.decrement_review_count()
            self.student_repo.save(student)
            self.rating_synchronizer.review_changed(review.courseID)
        except Exception:
            self.review_repo.save(original_review)
            student.reviewCount = original_review_count
            self.student_repo.save(student)
            self.rating_synchronizer.review_changed(original_review.courseID)
            raise

        return True

    def _get_review_or_raise(self, review_id):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        return review

    def _get_owned_review_or_raise(self, review_id, student_id):
        review = self._get_review_or_raise(review_id)
        if review.authorID != student_id:
            raise PermissionError("Unauthorized to modify this review.")
        return review

    def _get_student_or_raise(self, student_id):
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found. Please log in again.")
        return student

    def _get_course_or_raise(self, course_id):
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")
        return course
