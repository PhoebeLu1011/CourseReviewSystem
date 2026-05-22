from models.discussion import Discussion

class DiscussionRepository:
    def __init__(self, db):
        self.collection = db["discussions"]

    def delete_by_id(self, discussion_id):
        self.collection.delete_one({"_id": discussion_id})

    def find_by_id(self, discussion_id):
        data = self.collection.find_one({"_id": discussion_id})
        if not data: return None
        
        data.pop("_id", None) 
        return Discussion(**data)

    def save(self, discussion: Discussion):
        self.collection.update_one(
            {"_id": discussion.discussion_id},
            {"$set": discussion.to_dict()},
            upsert=True
        )

    def find_by_course_id(self, course_id, sort_by="newest", limit=10, skip=0):
        query = {
            "course_id": course_id
        }

        if sort_by == "popular":
            sort_logic = [("likeCount", -1), ("created_at", -1)]
        else:
            sort_logic = [("created_at", -1)]

        cursor = self.collection.find(query).sort(sort_logic).skip(skip).limit(limit)
        discussions = []
        for data in cursor:
            data.pop("_id", None)
            discussions.append(Discussion(**data))
        return discussions