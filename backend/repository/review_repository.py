from models.review import Review

class ReviewRepository:
    def __init__(self, db):
        self.collection = db["reviews"]

    def delete_by_id(self, review_id):
        self.collection.delete_one({"reviewID": review_id})

    def hide_review(self, review_id):
        """隱藏評價（UC9 HIDE_REVIEW 使用）"""
        self.collection.update_one(
            {"reviewID": review_id},
            {"$set": {"visibilityState": "HIDDEN"}}
        )

    def reset_visibility(self, review_id):
        """解除隱藏，恢復為可見（原本的方法，語意不變）"""
        self.collection.update_one(
            {"reviewID": review_id},
            {"$set": {"visibilityState": "VISIBLE", "reportCount": 0}}
        )

    def find_by_id(self, review_id):
        data = self.collection.find_one({"reviewID": review_id})
        if not data:
            return None
        data.pop("_id", None)
        return Review(**data)

    def save(self, review: Review):
        self.collection.update_one(
            {"reviewID": review.reviewID},
            {"$set": review.to_dict()},
            upsert=True
        )

    def find_by_course_id(self, course_id, sort_by="newest", limit=10, skip=0):
        query = {"courseID": course_id, "visibilityState": "VISIBLE"}
        
        # 💡 NEW: Update the MongoDB sorting criteria dynamically
        if sort_by == "likes":
            sort_criteria = [("likeCount", -1), ("timestamp", -1)]  # Highest likes first, then newest
        else:
            sort_criteria = [("timestamp", -1)]  # Default: Newest first
            
        cursor = self.collection.find(query).sort(sort_criteria).skip(skip).limit(limit)
        
        # Safely extract and instantiate the Review items
        from models.review import Review
        reviews = []
        for r in cursor:
            r.pop('_id', None)  # Clean out MongoDB object IDs
            reviews.append(Review(**r))
            
        return reviews
    
    def find_all_reviews(self, search_query="", sort_by="newest", limit=20, skip=0):
        # Base query: only visible reviews
        query = {"visibilityState": "VISIBLE"}
        
        # If the user typed a search term, look in BOTH courseID and courseName
        if search_query:
            query["$or"] = [
                {"courseID": {"$regex": search_query, "$options": "i"}},
                {"courseName": {"$regex": search_query, "$options": "i"}}
            ]

        if sort_by == "popular":
            sort_logic = [("likeCount", -1), ("timestamp", -1)]
        else:
            sort_logic = [("timestamp", -1)]

        cursor = self.collection.find(query).sort(sort_logic).skip(skip).limit(limit)
        reviews = []
        for data in cursor:
            data.pop("_id", None)
            reviews.append(Review(**data))
        return reviews
    
    def has_user_reviewed_course(self, student_id, course_id):
        # Counts how many reviews match BOTH the student and the course
        # Returns True if they already reviewed it, False if they haven't
        count = self.collection.count_documents({
            "authorID": student_id,
            "courseID": course_id
        })
        return count > 0
