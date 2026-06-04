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
        
        # --- MISSING LOGIC ADDED HERE: Fetch the student, +1 their count, and save! ---
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found. Please log in again.")
            
        student.reviewCount += 1
        self.student_repo.save(student)
        # ------------------------------------------------------------------------------

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
            self._sync_course_ratings(course_id)
        except Exception as e:
            pass
            


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
        # Fetch directly from collection to avoid needing new repo methods
        reviews_data = self.review_repo.collection.find({"authorID": student_id, "visibilityState": "VISIBLE"}).sort("timestamp", -1)
        from models.review import Review
        
        # --- FIX: Remove MongoDB's '_id' before building the Python object ---
        reviews = []
        for r in reviews_data:
            r.pop('_id', None) 
            reviews.append(Review(**r))
            
        return reviews

    def update_review(self, review_id, student_id, content, sweetness, workload):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        if review.authorID != student_id:
            raise ValueError("Unauthorized to edit this review.")

        # Update the fields
        review.content = content
        review.sweetnessScore = sweetness
        review.workloadScore = workload
        
        self.review_repo.save(review)
        
        # Trigger course score recalculation
        try:
            self._sync_course_ratings(review.courseID)
        except Exception as e:
            pass
            
        return review.to_dict()

    def delete_review(self, review_id, student_id):
        review = self.review_repo.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found.")
        if review.authorID != student_id:
            raise ValueError("Unauthorized to delete this review.")

        course_id = review.courseID

        # 1. Delete the review
        self.review_repo.collection.delete_one({"reviewID": review_id})

        # 2. Subtract 1 from the student's review count
        student = self.student_repo.find_by_id(student_id)
        if student and student.reviewCount > 0:
            student.reviewCount -= 1
            self.student_repo.save(student)

        # 3. Trigger course score recalculation
        try:
            self._sync_course_ratings(course_id)
        except Exception as e:
            pass
            
        return True
    
    def _sync_course_ratings(self, course_id):
        """Helper to fetch all active reviews and force a complete recalculation from scratch."""
        reviews_cursor = self.review_repo.collection.find({"courseID": course_id, "visibilityState": "VISIBLE"})
        reviews_list = list(reviews_cursor)
        self.course_service.recalculate_course_ratings(course_id, reviews_list)