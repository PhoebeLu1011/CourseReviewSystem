from models.review import Review

class ReviewRepository:
    def __init__(self, db):
        self.collection = db["reviews"]

    def delete_by_id(self, review_id):
        """軟刪除：標記為 DELETED 而非真正從 DB 移除"""
        self.collection.update_one(
            {"reviewID": review_id},
            {"$set": {"visibilityState": "DELETED"}}
        )

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
        # VISIBLE 正常顯示，HIDDEN 前端顯示佔位訊息，DELETED 完全不顯示
        query = {
            "courseID": course_id,
            "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}
        }

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
    
    def calc_course_averages(self, course_id):
        """從 VISIBLE + HIDDEN 評論計算平均（DELETED 不計入）"""
        pipeline = [
            {"$match": {"courseID": course_id, "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}}},
            {"$group": {
                "_id": "$courseID",
                "avgSweetness": {"$avg": "$sweetnessScore"},
                "avgWorkload": {"$avg": "$workloadScore"},
                "count": {"$sum": 1}
            }}
        ]
        result = list(self.collection.aggregate(pipeline))
        if result:
            return result[0]["avgSweetness"], result[0]["avgWorkload"], result[0]["count"]
        return 0.0, 0.0, 0

    def find_by_course_all(self, course_id):
        """取得課程所有評論（含隱藏），供前端顯示佔位用"""
        cursor = self.collection.find(
            {"courseID": course_id},
            {"_id": 0}
        ).sort([("timestamp", -1)])
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
