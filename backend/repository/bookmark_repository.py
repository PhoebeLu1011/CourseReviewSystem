from datetime import datetime
from models.bookmark import Bookmark


class BookmarkRepository:
    def __init__(self, db):
        self.collection = db["bookmarks"]

    def _to_bookmark(self, data):
        if not data:
            return None
        data.pop("_id", None)
        if isinstance(data.get("createdAt"), str):
            data["createdAt"] = datetime.fromisoformat(data["createdAt"])
        return Bookmark(
            bookmarkId=data["bookmarkId"],
            userId=data["userId"],
            courseId=data["courseId"],
            createdAt=data.get("createdAt")
        )

    def find_by_user(self, userId):
        cursor = self.collection.find({"userId": userId})
        return [self._to_bookmark(data) for data in cursor]

    def find_by_user_and_course(self, userId, courseId):
        data = self.collection.find_one({"userId": userId, "courseId": courseId})
        return self._to_bookmark(data)

    def save(self, bookmark: Bookmark):
        self.collection.update_one(
            {"bookmarkId": bookmark.bookmarkId},
            {"$set": bookmark.to_dict()},
            upsert=True
        )

    def delete(self, userId, courseId):
        self.collection.delete_one({"userId": userId, "courseId": courseId})

    def count_by_course(self, courseId):
        return self.collection.count_documents({"courseId": courseId})
