import uuid
from datetime import datetime

class Discussion:
    def __init__(
        self,
        authorID,
        courseID,
        title,
        content,
        discussionID=None,
        likedBy=None,
        likeCount=0,
        replyCount=0,
        timestamp=None,
        lastReplyAt=None,
        visibilityState="VISIBLE",
    ):
        self.discussionID = discussionID if discussionID else str(uuid.uuid4())
        self.authorID = authorID
        self.courseID = courseID
        self.title = self._required_text(title, "title")
        self.content = self._required_text(content, "content")
        self.likedBy = list(dict.fromkeys(likedBy or []))
        self.likeCount = len(self.likedBy)
        self.replyCount = replyCount
        self.timestamp = timestamp if timestamp else datetime.now()
        self.lastReplyAt = lastReplyAt if lastReplyAt else self.timestamp
        self.visibilityState = visibilityState
        self._validate()

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    def _validate(self):
        if self.visibilityState not in {"VISIBLE", "HIDDEN", "DELETED"}:
            raise ValueError("Invalid discussion visibilityState.")
        if self.replyCount < 0:
            raise ValueError("replyCount cannot be negative.")

    def update_content(self, title, content):
        self.title = self._required_text(title, "title")
        self.content = self._required_text(content, "content")

    def soft_delete(self):
        self.visibilityState = "DELETED"

    def toggle_like(self, student_id):
        if student_id in self.likedBy:
            self.likedBy.remove(student_id)
            self.likeCount = max(0, self.likeCount - 1)
        else:
            self.likedBy.append(student_id)
            self.likeCount += 1

    def to_dict(self):
        return {
            "discussionID": self.discussionID,
            "authorID": self.authorID,
            "courseID": self.courseID,
            "title": self.title,
            "content": self.content,
            "likedBy": self.likedBy,
            "likeCount": self.likeCount,
            "replyCount": self.replyCount,
            # Safely convert datetimes to strings
            "timestamp": self.timestamp.isoformat() if hasattr(self.timestamp, 'isoformat') else self.timestamp,
            "lastReplyAt": self.lastReplyAt.isoformat() if hasattr(self.lastReplyAt, 'isoformat') else self.lastReplyAt,
            "visibilityState": self.visibilityState,
        }

class Reply:
    def __init__(
        self, 
        discussionID, 
        authorID, 
        content, 
        replyID=None, 
        likedBy=None, 
        likeCount=0, 
        timestamp=None, 
        visibilityState="VISIBLE"
    ):
        self.replyID = replyID if replyID else str(uuid.uuid4())
        self.discussionID = discussionID
        self.authorID = authorID
        self.content = Discussion._required_text(content, "content")
        self.likedBy = list(dict.fromkeys(likedBy or []))
        self.likeCount = len(self.likedBy)
        self.timestamp = timestamp if timestamp else datetime.now()
        self.visibilityState = visibilityState
        if self.visibilityState not in {"VISIBLE", "HIDDEN", "DELETED"}:
            raise ValueError("Invalid reply visibilityState.")

    def update_content(self, content):
        self.content = Discussion._required_text(content, "content")

    def soft_delete(self):
        self.visibilityState = "DELETED"

    def toggle_like(self, student_id):
        if student_id in self.likedBy:
            self.likedBy.remove(student_id)
            self.likeCount = max(0, self.likeCount - 1)
        else:
            self.likedBy.append(student_id)
            self.likeCount += 1

    def to_dict(self):
        return {
            "replyID": self.replyID,
            "discussionID": self.discussionID,
            "authorID": self.authorID,
            "content": self.content,
            "likedBy": self.likedBy,
            "likeCount": self.likeCount,
            # Safely convert datetimes to strings
            "timestamp": self.timestamp.isoformat() if hasattr(self.timestamp, 'isoformat') else self.timestamp,
            "visibilityState": self.visibilityState,
        }