from models.discussion import Discussion

class DiscussionRepository:
    def __init__(self, db):
        self.collection = db["discussions"]

    def find_discussion_by_id(self, discussion_id):
        data = self.collection.find_one({"discussionID": discussion_id})
        if not data: return None
        data.pop("_id", None)
        return Discussion(**data)

    def save_discussion(self, discussion: Discussion):
        self.collection.update_one(
            {"discussionID": discussion.discussionID},
            {"$set": discussion.to_dict()},
            upsert=True
        )

    def find_by_course_id(self, course_id):
        cursor = self.collection.find({"courseID": course_id}).sort("timestamp", -1)
        results = []
        for d in cursor:
            d.pop("_id", None)
            results.append(Discussion(**d))
        return results

    def find_all_discussions(self, search_query=""):
        query = {}
        if search_query:
            query["$or"] = [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"content": {"$regex": search_query, "$options": "i"}},
                {"courseID": {"$regex": search_query, "$options": "i"}}
            ]
        cursor = self.collection.find(query).sort("timestamp", -1)
        results = []
        for d in cursor:
            d.pop("_id", None)
            results.append(Discussion(**d))
        return results
    
    def find_by_author_id(self, author_id):
        cursor = self.collection.find({"authorID": author_id}).sort("timestamp", -1)
        results = []
        for d in cursor:
            d.pop("_id", None)
            from models.discussion import Discussion
            results.append(Discussion(**d))
        return results

    def delete_discussion(self, discussion_id):
        self.collection.delete_one({"discussionID": discussion_id})