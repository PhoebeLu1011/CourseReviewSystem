from models.discussion import Discussion
from pymongo import ReturnDocument

class DiscussionRepository:
    def __init__(self, db):
        self.collection = db["discussions"]

    def _visible_query(self, query):
        return {
            "$and": [
                query,
                {
                    "$or": [
                        {"visibilityState": "VISIBLE"},
                        {"visibilityState": {"$exists": False}},
                    ]
                },
            ]
        }

    def _to_discussion(self, data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Discussion(**data)

    def find_discussion_by_id(self, discussion_id):
        data = self.collection.find_one(
            self._visible_query({"discussionID": discussion_id})
        )
        return self._to_discussion(data)

    def save_discussion(self, discussion: Discussion):
        self.collection.update_one(
            {"discussionID": discussion.discussionID},
            {"$set": discussion.to_dict()},
            upsert=True
        )

    def find_by_course_id(self, course_id):
        cursor = self.collection.find(
            self._visible_query({"courseID": course_id})
        ).sort("timestamp", -1)
        results = []
        for d in cursor:
            results.append(self._to_discussion(d))
        return results

    def find_all_discussions(self, search_query=""):
        query = {}
        if search_query:
            query["$or"] = [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"content": {"$regex": search_query, "$options": "i"}},
                {"courseID": {"$regex": search_query, "$options": "i"}}
            ]
        cursor = self.collection.find(self._visible_query(query)).sort("timestamp", -1)
        results = []
        for d in cursor:
            results.append(self._to_discussion(d))
        return results
    
    def find_by_author_id(self, author_id):
        cursor = self.collection.find(
            self._visible_query({"authorID": author_id})
        ).sort("timestamp", -1)
        results = []
        for d in cursor:
            results.append(self._to_discussion(d))
        return results

    def delete_discussion(self, discussion_id):
        result = self.collection.update_one(
            self._visible_query({"discussionID": discussion_id}),
            {"$set": {"visibilityState": "DELETED"}},
        )
        return result.modified_count > 0

    def increment_reply_count(self, discussion_id, amount):
        data = self.collection.find_one_and_update(
            self._visible_query({"discussionID": discussion_id}),
            [
                {
                    "$set": {
                        "replyCount": {
                            "$max": [
                                0,
                                {"$add": [{"$ifNull": ["$replyCount", 0]}, amount]},
                            ]
                        }
                    }
                }
            ],
            return_document=ReturnDocument.AFTER,
        )
        return self._to_discussion(data)

    def toggle_like(self, discussion_id, student_id):
        data = self.collection.find_one_and_update(
            self._visible_query({"discussionID": discussion_id}),
            [
                {
                    "$set": {
                        "likedBy": {
                            "$cond": [
                                {"$in": [student_id, {"$ifNull": ["$likedBy", []]}]},
                                {
                                    "$setDifference": [
                                        {"$ifNull": ["$likedBy", []]},
                                        [student_id],
                                    ]
                                },
                                {
                                    "$setUnion": [
                                        {"$ifNull": ["$likedBy", []]},
                                        [student_id],
                                    ]
                                },
                            ]
                        }
                    }
                },
                {"$set": {"likeCount": {"$size": "$likedBy"}}},
            ],
            return_document=ReturnDocument.AFTER,
        )
        return self._to_discussion(data)
