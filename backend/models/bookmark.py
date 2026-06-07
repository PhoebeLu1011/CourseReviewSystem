import uuid
from datetime import datetime, timezone


class Bookmark:
    def __init__(self, bookmarkId, userId, courseId, createdAt=None):
        self.bookmarkId = self._required_text(bookmarkId, "bookmarkId")
        self.userId = self._required_text(userId, "userId")
        self.courseId = self._required_text(courseId, "courseId")
        self.createdAt = self._parse_datetime(createdAt) or datetime.now(timezone.utc)

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    @staticmethod
    def _parse_datetime(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            parsed = value
        elif isinstance(value, str):
            try:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError as error:
                raise ValueError("createdAt must be a valid ISO datetime.") from error
        else:
            raise ValueError("createdAt must be a valid ISO datetime.")
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

    def to_dict(self):
        return {
            "bookmarkId": self.bookmarkId,
            "userId": self.userId,
            "courseId": self.courseId,
            "createdAt": self.createdAt.isoformat(),
        }


class BookmarkFactory:
    """Factory Method that keeps bookmark identity creation out of the use case."""

    def __init__(self, id_factory=None):
        self.id_factory = id_factory or (lambda: str(uuid.uuid4()))

    def create(self, user_id, course_id):
        return Bookmark(
            bookmarkId=self.id_factory(),
            userId=user_id,
            courseId=course_id,
        )
