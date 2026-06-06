import uuid
from datetime import datetime

class Discussion:
    def __init__(self, authorID, courseID, title, content, discussionID=None, likedBy=None, likeCount=0, replyCount=0, timestamp=None):
        self.discussionID = discussionID if discussionID else str(uuid.uuid4())
        self.authorID = authorID
        self.courseID = courseID
        self.title = title
        self.content = content
        self.likedBy = likedBy if likedBy is not None else []
        self.likeCount = likeCount
        self.replyCount = replyCount
        self.timestamp = timestamp if timestamp else datetime.now()

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
            "timestamp": self.timestamp
        }

class Reply:
    def __init__(self, discussionID, authorID, content, replyID=None, likedBy=None, likeCount=0, timestamp=None, visibilityState="VISIBLE",):
        self.replyID = replyID if replyID else str(uuid.uuid4())
        self.discussionID = discussionID
        self.authorID = authorID
        self.content = content
        self.likedBy = likedBy if likedBy is not None else []
        self.likeCount = likeCount
        self.timestamp = timestamp if timestamp else datetime.now()
        self.visibilityState = visibilityState

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
            "timestamp": self.timestamp,
            "visibilityState": self.visibilityState,
        }
