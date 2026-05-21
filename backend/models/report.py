import uuid
from datetime import datetime

class Report:
    def __init__(self, reviewID, reporterID, reason, reportID=None, status="PENDING"):
        self.reportID = reportID if reportID else str(uuid.uuid4())
        self.reviewID = reviewID
        self.reporterID = reporterID
        self.reason = reason
        self.status = status # "PENDING", "RESOLVED", or "DISMISSED"
        self.timestamp = datetime.now()

    def to_dict(self):
        return {
            "reportID": self.reportID,
            "reviewID": self.reviewID,
            "reporterID": self.reporterID,
            "reason": self.reason,
            "status": self.status,
            "timestamp": self.timestamp
        }