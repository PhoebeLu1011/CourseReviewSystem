import uuid
from datetime import datetime
from enum import Enum


class ReportReason(Enum):
    SPAM = "SPAM"
    HARASSMENT = "HARASSMENT"
    HATE_SPEECH = "HATE_SPEECH"
    OFFENSIVE_CONTENT = "OFFENSIVE_CONTENT"
    FALSE_INFORMATION = "FALSE_INFORMATION"
    INAPPROPRIATE_LANGUAGE = "INAPPROPRIATE_LANGUAGE"
    OTHER = "OTHER"


class Report:
    def __init__(
        self,
        reporterID,
        reported_type,
        reported_id,
        reason,
        reportID=None,
        description=None,
        status="PENDING",
        handler_id=None,
        resolution=None,
        timestamp=None,
        **kwargs
    ):
        self.reportID = reportID if reportID else str(uuid.uuid4())
        self.reporterID = reporterID
        self.reported_type = reported_type
        self.reported_id = reported_id
        self.reason = reason
        self.description = description
        self.status = status
        self.handler_id = handler_id
        self.resolution = resolution

        if isinstance(timestamp, datetime):
            self.timestamp = timestamp.isoformat()
        else:
            self.timestamp = timestamp or datetime.now().isoformat()

    def to_dict(self):
        return {
            "reportID": self.reportID,
            "reporterID": self.reporterID,
            "reported_type": self.reported_type,
            "reported_id": self.reported_id,
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "handler_id": self.handler_id,
            "resolution": self.resolution,
            "timestamp": self.timestamp,
        }
