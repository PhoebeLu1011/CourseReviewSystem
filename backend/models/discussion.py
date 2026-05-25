import uuid
from datetime import datetime

class Discussion:
    def __init__(self, course_id, student_id, title, content, discussion_id=None, liked_by=None, created_at=None):
        self.discussion_id = discussion_id or str(uuid.uuid4())
        self.course_id = course_id
        self.student_id = student_id
        self.title = title
        self.content = content
        self.liked_by = liked_by if liked_by is not None else [] # List of student IDs
        self.created_at = created_at or datetime.utcnow()

    def toggle_like(self, student_id):
        if student_id in self.liked_by:
            self.liked_by.remove(student_id)
        else:
            self.liked_by.append(student_id)

    def to_dict(self):
        return {
            "_id": self.discussion_id,
            "course_id": self.course_id,
            "student_id": self.student_id,
            "title": self.title,
            "content": self.content,
            "liked_by": self.liked_by,
            "likeCount": len(self.liked_by),
            "created_at": self.created_at
        }