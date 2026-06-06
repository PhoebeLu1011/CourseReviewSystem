from datetime import datetime


class Bookmark:
    def __init__(self, bookmarkId, userId, courseId, createdAt=None):
        self.bookmarkId = bookmarkId
        self.userId = userId
        self.courseId = courseId
        self.createdAt = createdAt or datetime.utcnow()

    def to_dict(self):
        return {
            "bookmarkId": self.bookmarkId,
            "userId": self.userId,
            "courseId": self.courseId,
            "createdAt": self.createdAt.isoformat()
        }
