from datetime import datetime
import uuid


class Review:
    ALLOWED_VISIBILITY_STATES = {"VISIBLE", "HIDDEN", "DELETED", "UNDER_REVIEW"}

    def __init__(self, authorID, courseID, content, sweetnessScore, workloadScore,
                 reviewID=None, visibilityState="VISIBLE", reportCount=0,
                 likedBy=None, likeCount=0, timestamp=None, courseName=""):
        self.reviewID = reviewID if reviewID else str(uuid.uuid4())
        self.authorID = authorID
        self.courseID = courseID
        self.courseName = courseName
        self.content = self._validate_content(content)
        self.sweetnessScore = self._validate_score(sweetnessScore, "sweetnessScore")
        self.workloadScore = self._validate_score(workloadScore, "workloadScore")
        if visibilityState not in self.ALLOWED_VISIBILITY_STATES:
            raise ValueError("Invalid review visibility state.")
        self.visibilityState = visibilityState
        self.reportCount = reportCount
        self.timestamp = timestamp if timestamp else datetime.now()
        self.likedBy = likedBy if likedBy is not None else []
        self.likeCount = likeCount

    def update(self, content, sweetness_score, workload_score):
        if self.visibilityState == "DELETED":
            raise ValueError("Deleted reviews cannot be edited.")

        self.content = self._validate_content(content)
        self.sweetnessScore = self._validate_score(sweetness_score, "sweetnessScore")
        self.workloadScore = self._validate_score(workload_score, "workloadScore")

    def mark_deleted(self):
        if self.visibilityState == "DELETED":
            raise ValueError("Review is already deleted.")
        self.visibilityState = "DELETED"

    @staticmethod
    def _validate_content(content):
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Review content is required.")
        return content.strip()

    @staticmethod
    def _validate_score(score, field_name):
        if isinstance(score, bool) or not isinstance(score, (int, float)):
            raise ValueError(f"{field_name} must be a number between 1 and 5.")
        if not 1 <= score <= 5:
            raise ValueError(f"{field_name} must be between 1 and 5.")
        return score

    def to_dict(self):
        return {
            "reviewID": self.reviewID,
            "authorID": self.authorID,
            "courseID": self.courseID,
            "courseName": self.courseName,
            "content": self.content,
            "sweetnessScore": self.sweetnessScore,
            "workloadScore": self.workloadScore,
            "visibilityState": self.visibilityState,
            "reportCount": self.reportCount,
            "timestamp": self.timestamp,
            "likedBy": self.likedBy,
            "likeCount": self.likeCount
        }

    def toggle_like(self, student_id):
        """
        Toggles a student's like status. If they already liked it, 
        unlike it. Otherwise, add their ID to the likedBy list.
        """
        if not student_id:
            raise ValueError("Student ID is required.")
        if self.visibilityState == "DELETED":
            raise ValueError("Deleted reviews cannot be liked.")

        if student_id in self.likedBy:
            self.likedBy.remove(student_id)
            self.likeCount = max(0, self.likeCount - 1)
        else:
            self.likedBy.append(student_id)
            self.likeCount += 1
