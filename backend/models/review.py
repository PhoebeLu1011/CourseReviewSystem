from datetime import datetime
import uuid

class Review:
    def __init__(self, authorID, courseID, content, sweetnessScore, workloadScore, 
                 reviewID=None, visibilityState="VISIBLE", reportCount=0, 
                 likedBy=None, likeCount=0, timestamp=None, courseName=""): # <-- Add courseName=""
        
        self.reviewID = reviewID if reviewID else str(uuid.uuid4()) 
        self.authorID = authorID
        self.courseID = courseID
        self.courseName = courseName # <-- Save it here
        # ... (keep all your other existing fields the same) ...
        self.content = content
        self.sweetnessScore = max(1, min(5, sweetnessScore))
        self.workloadScore = max(1, min(5, workloadScore))
        self.visibilityState = visibilityState
        self.reportCount = reportCount
        self.timestamp = timestamp if timestamp else datetime.now()
        self.likedBy = likedBy if likedBy is not None else []
        self.likeCount = likeCount

    def to_dict(self):
        return {
            "reviewID": self.reviewID,
            "authorID": self.authorID,
            "courseID": self.courseID,
            "courseName": self.courseName, # <-- Add to dictionary
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
        if student_id in self.likedBy:
            self.likedBy.remove(student_id)
            self.likeCount = max(0, self.likeCount - 1)
        else:
            self.likedBy.append(student_id)
            self.likeCount += 1