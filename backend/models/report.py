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


REPORT_TYPES = {"review", "comment", "teammate_post"}
REPORT_STATUSES = {"PENDING", "RESOLVED", "DISMISSED", "WITHDRAWN"}


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
        self.reporterID = self._required_text(reporterID, "reporterID")
        self.reported_type = self._required_text(reported_type, "reported_type")
        self.reported_id = self._required_text(reported_id, "reported_id")
        self.reason = self._required_text(reason, "reason")
        self.description = description.strip() if isinstance(description, str) else None
        self.status = status
        self.handler_id = handler_id
        self.resolution = resolution
        self._validate()

        if isinstance(timestamp, datetime):
            self.timestamp = timestamp.isoformat()
        else:
            self.timestamp = timestamp or datetime.now().isoformat()

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    def _validate(self):
        if self.reported_type not in REPORT_TYPES:
            raise ValueError("Invalid reported_type.")
        if self.reason not in {reason.value for reason in ReportReason}:
            raise ValueError("Invalid report reason.")
        if self.status not in REPORT_STATUSES:
            raise ValueError("Invalid report status.")

    def is_pending(self):
        return self.status == "PENDING"

    def resolve(self, handler_id, resolution):
        self._complete("RESOLVED", handler_id, resolution)

    def dismiss(self, handler_id, resolution="dismissed"):
        self._complete("DISMISSED", handler_id, resolution)

    def withdraw(self, reporter_id):
        if self.reporterID != reporter_id:
            raise PermissionError("Only the reporter can withdraw this report.")
        if not self.is_pending():
            raise ValueError("Only pending reports can be withdrawn.")
        self.status = "WITHDRAWN"

    def _complete(self, status, handler_id, resolution):
        if not self.is_pending():
            raise ValueError("Only pending reports can be processed.")
        self.status = status
        self.handler_id = self._required_text(handler_id, "handler_id")
        self.resolution = self._required_text(resolution, "resolution")

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
