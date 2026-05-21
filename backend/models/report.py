import uuid
from datetime import datetime
from enum import Enum


class ReportReason(Enum):
    SPAM = "SPAM"
    HARASSMENT = "HARASSMENT"
    OFFENSIVE_CONTENT = "OFFENSIVE_CONTENT"
    FALSE_INFORMATION = "FALSE_INFORMATION"
    INAPPROPRIATE_LANGUAGE = "INAPPROPRIATE_LANGUAGE"
    OTHER = "OTHER"


class Report:
    def __init__(self, reviewID, reporterID, reason, reportID=None, status="PENDING"):
        self.reportID = reportID if reportID else str(uuid.uuid4())
        self.reviewID = reviewID
        self.reporterID = reporterID
        self.reason = reason.value if isinstance(reason, ReportReason) else reason
        self.status = status  # "PENDING", "RESOLVED", "DISMISSED"
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
