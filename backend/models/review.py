from datetime import datetime
import uuid

class Review:
    def __init__(self, authorID, courseID, content, sweetnessScore, workloadScore, reviewID=None, visibilityState="VISIBLE", reportCount=0, likedBy=None, likeCount=0):
        # If no reviewID is provided, generate a unique string ID
        self.reviewID = reviewID if reviewID else str(uuid.uuid4()) 
        self.authorID = authorID
        self.courseID = courseID # Don't forget to link the course!
        self.content = content
        self.sweetnessScore = max(1, min(5, sweetnessScore))  # Ensure score is between 1 and 5
        self.workloadScore = max(1, min(5, workloadScore))  # Ensure score is between 1 and 5
        self.visibilityState = visibilityState
        self.reportCount = reportCount
        self.timestamp = datetime.now()
        self.likedBy = likedBy if likedBy is not None else []
        self.likeCount = likeCount

    
    def add_report(self):
        """Increments the report count and updates visibility if necessary."""
        self.reportCount += 1
        if self.reportCount >= 3:
            self.visibilityState = "UNDER_REVIEW"
    
    def toggle_like(self, user_id):
        if user_id in self.likedBy:
            self.likedBy.remove(user_id)
            self.likeCount -= 1
        else:
            self.likedBy.append(user_id)
            self.likeCount += 1

    def to_dict(self):
        return {
            "reviewID": self.reviewID,
            "authorID": self.authorID,
            "courseID": self.courseID,
            "content": self.content,
            "sweetnessScore": self.sweetnessScore,
            "workloadScore": self.workloadScore,
            "visibilityState": self.visibilityState,
            "reportCount": self.reportCount,
            "timestamp": self.timestamp,
            "likedBy": self.likedBy,
            "likeCount": self.likeCount
        }