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

    def hard_delete_by_id(self, review_id):
        """Only used to compensate a failed create workflow."""
        self.collection.delete_one({"reviewID": review_id})
    def hide_review(self, review_id):
        """隱藏評價（UC9 HIDE_REVIEW 使用）"""
        self.collection.update_one(
            {"reviewID": review_id},
            {"$set": {"visibilityState": "HIDDEN"}}
        )

    def reset_visibility(self, review_id):
        """解除隱藏，恢復為可見"""
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
        """
        取得某課程的評論。

        VISIBLE：正常顯示
        HIDDEN：前端顯示佔位訊息
        DELETED：完全不顯示
        """
        query = {
            "courseID": course_id,
            "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}
        }

        if sort_by == "popular":
            sort_criteria = [("likeCount", -1), ("timestamp", -1)]
        else:
            sort_criteria = [("timestamp", -1)]

        cursor = (
            self.collection
            .find(query)
            .sort(sort_criteria)
            .skip(skip)
            .limit(limit)
        )

        reviews = []
        for data in cursor:
            data.pop("_id", None)
            reviews.append(Review(**data))

        return reviews

    def find_all_reviews(self, search_query="", sort_by="newest", department="", limit=20, skip=0):
        pipeline = [{"$match": {"visibilityState": "VISIBLE"}}]
        
        # 1. Search Query Match
        if search_query:
            pipeline.append({
                "$match": {
                    "$or": [
                        {"courseID": {"$regex": search_query, "$options": "i"}},
                        {"courseName": {"$regex": search_query, "$options": "i"}}
                    ]
                }
            })

        # 2. Department Filter (Join with Courses collection)
        if department:
            import re
            pipeline.extend([
                {
                    "$lookup": {
                        "from": "courses",
                        "localField": "courseID",
                        "foreignField": "courseID",
                        "as": "course_info"
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {"course_info.department": {"$regex": re.escape(department), "$options": "i"}},
                            {"course_info.開課系所": {"$regex": re.escape(department), "$options": "i"}}
                        ]
                    }
                }
            ])

        # 3. Sorting
        if sort_by in ["popular", "likes"]:
            pipeline.append({"$sort": {"likeCount": -1, "timestamp": -1}})
        else:
            pipeline.append({"$sort": {"timestamp": -1}})

        # 4. Pagination
        pipeline.append({"$skip": skip})
        pipeline.append({"$limit": limit})

        cursor = self.collection.aggregate(pipeline)
        
        from models.review import Review
        reviews = []
        for data in cursor:
            data.pop("_id", None)
            data.pop("course_info", None) # Clean up the joined data
            reviews.append(Review(**data))
            
        return reviews

    def find_visible_by_student(self, student_id):
        cursor = (
            self.collection
            .find({
                "authorID": student_id,
                "visibilityState": "VISIBLE",
            })
            .sort("timestamp", -1)
        )

        reviews = []
        for data in cursor:
            data.pop("_id", None)
            reviews.append(Review(**data))

        return reviews

    def calc_course_averages(self, course_id):
        """
        從 VISIBLE + HIDDEN 評論計算平均。
        DELETED 不計入。
        """
        pipeline = [
            {
                "$match": {
                    "courseID": course_id,
                    "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}
                }
            },
            {
                "$group": {
                    "_id": "$courseID",
                    "avgSweetness": {"$avg": "$sweetnessScore"},
                    "avgWorkload": {"$avg": "$workloadScore"},
                    "count": {"$sum": 1}
                }
            }
        ]

        result = list(self.collection.aggregate(pipeline))

        if result:
            return (
                result[0]["avgSweetness"],
                result[0]["avgWorkload"],
                result[0]["count"]
            )

        return 0.0, 0.0, 0

    def find_by_course_all(self, course_id):
        """
        取得課程所有非刪除評論，包含 HIDDEN。
        供前端顯示佔位用。
        """
        cursor = (
            self.collection
            .find(
                {
                    "courseID": course_id,
                    "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}
                },
                {"_id": 0}
            )
            .sort([("timestamp", -1)])
        )

        reviews = []
        for data in cursor:
            data.pop("_id", None)
            reviews.append(Review(**data))

        return reviews

    def has_user_reviewed_course(self, student_id, course_id):
        """
        檢查學生是否已經評論過該課程。

        VISIBLE / HIDDEN 都算已評論。
        DELETED 不算，因為已經被軟刪除。
        """
        count = self.collection.count_documents({
            "authorID": student_id,
            "courseID": course_id,
            "visibilityState": {"$in": ["VISIBLE", "HIDDEN"]}
        })

        return count > 0
