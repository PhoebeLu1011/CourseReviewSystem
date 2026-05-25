from repository.review_repository import ReviewRepository
from repository.student_repository import StudentRepository
class ReviewService:
    def __init__(self, review_repo: ReviewRepository, student_repo: StudentRepository, course_service):
        self.review_repo = review_repo
        self.student_repo = student_repo
        self.course_service = course_service


    def create_review(self, student_id, course_id, content, sweetness, workload):
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found.")
        new_review = student.leave_review(course_id, content, sweetness, workload)
        self.review_repo.save(new_review)
        self.student_repo.save(student)  # Update student's review count
        self.course_service.update_course_ratings(course_id, sweetness, workload)
        return new_review.to_dict()
        pass
    


    def handle_like(self, review_id, student_id):

        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        
        review.toggle_like(student_id)

        self.review_repo.save(review)
        return review.likeCount
    

    def get_reviews_by_course(self, course_id, sort_by="newest", limit=10, skip=0):
        return self.review_repo.find_by_course_id(course_id, sort_by, limit, skip)