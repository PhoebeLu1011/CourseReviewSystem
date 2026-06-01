from repository.review_repository import ReviewRepository
from repository.student_repository import StudentRepository
class ReviewService:
    def __init__(self, review_repo: ReviewRepository, student_repo: StudentRepository, course_service):
        self.review_repo = review_repo
        self.student_repo = student_repo
        self.course_service = course_service


    def create_review(self, student_id, course_id, content, sweetness, workload):
        if self.review_repo.has_user_reviewed_course(student_id, course_id):
            raise ValueError(f"You have already submitted a review for course {course_id}.")
        from models.review import Review 
        
        # Look up the course to grab its real title!
        course = self.course_service.course_repo.find_by_id(course_id)
        # If found, use title. If not (or if it's a custom test ID), just leave it blank
        course_name = course.title if course else ""
        
        new_review = Review(
            authorID=student_id,
            courseID=course_id,
            courseName=course_name, # <-- Stamp it onto the review!
            content=content,
            sweetnessScore=sweetness,
            workloadScore=workload
        )
        
        self.review_repo.save(new_review)
        
        try:
            self.course_service.update_course_ratings(course_id, sweetness, workload)
        except Exception as e:
            print(f"Warning: Could not update course stats: {e}")
            
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