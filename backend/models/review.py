from datetime import datetime
import uuid

class Review:
    def __init__(self, authorID, courseID, content, sweetnessScore, workloadScore, reviewID=None, visibilityState="VISIBLE", reportCount=0):
        # If no reviewID is provided, generate a unique string ID
        self.reviewID = reviewID if reviewID else str(uuid.uuid4()) 
        self.authorID = authorID
        self.courseID = courseID # Don't forget to link the course!
        self.content = content
        self.sweetnessScore = sweetnessScore
        self.workloadScore = workloadScore
        self.visibilityState = visibilityState
        self.reportCount = reportCount
        self.timestamp = datetime.now()

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
            "timestamp": self.timestamp
        }
    def add_report(self):
        """Increments the report count and updates visibility if necessary."""
        self.reportCount += 1
        if self.reportCount >= 3:
            self.visibilityState = "UNDER_REVIEW"