import uuid
from datetime import datetime

class Report:
    def __init__(
        self,
        reviewID,                  # 被檢舉的評價 ID
        reporterID,                # 檢舉人 ID
        reason,                    # 檢舉原因
        reportID=None,             # 檢舉案件自己的 ID
        reported_type="review",    # 新增：支援 review/comment/teammate_post
        reported_id=None,          # 新增：被檢舉的物件 ID（更通用）
        description=None,          # 新增：額外說明
        status="PENDING",          # PENDING / RESOLVED / DISMISSED
        handler_id=None,           # 處理的管理員 ID
        resolution=None,           # 處理結果 (deleted, hidden, warned...)
        timestamp=None
    ):
        self.reportID = reportID if reportID else str(uuid.uuid4())
        self.reviewID = reviewID
        self.reporterID = reporterID
        self.reported_type = reported_type
        self.reported_id = reported_id or reviewID
        self.reason = reason
        self.description = description
        self.status = status
        self.handler_id = handler_id
        self.resolution = resolution
        self.timestamp = timestamp or datetime.now()

    def to_dict(self):
        return {
            "reportID": self.reportID,
            "reviewID": self.reviewID,
            "reporterID": self.reporterID,
            "reported_type": self.reported_type,
            "reported_id": self.reported_id,
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "handler_id": self.handler_id,
            "resolution": self.resolution,
            "timestamp": self.timestamp
        }