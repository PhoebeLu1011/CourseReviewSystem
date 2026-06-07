from models.bookmark import Bookmark
from pymongo.errors import DuplicateKeyError


class BookmarkRepository:
    def __init__(self, db):
        self.collection = db["bookmarks"]

    def _to_bookmark(self, data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Bookmark(**data)

    def find_by_user(self, userId):
        cursor = self.collection.find({"userId": userId}).sort("createdAt", -1)
        return [self._to_bookmark(data) for data in cursor]

    def find_by_user_and_course(self, userId, courseId):
        data = self.collection.find_one({"userId": userId, "courseId": courseId})
        return self._to_bookmark(data)

    def insert_if_absent(self, bookmark: Bookmark):
        data = bookmark.to_dict()
        # Mongo's built-in unique _id makes the user-course command idempotent.
        data["_id"] = self._compound_id(bookmark.userId, bookmark.courseId)
        try:
            self.collection.insert_one(data)
            return True
        except DuplicateKeyError:
            return False

    def delete(self, userId, courseId):
        result = self.collection.delete_one({"userId": userId, "courseId": courseId})
        return result.deleted_count > 0

    def count_by_course(self, courseId):
        return self.collection.count_documents({"courseId": courseId})

    @staticmethod
    def _compound_id(user_id, course_id):
        return f"{user_id}:{course_id}"
