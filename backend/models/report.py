from datetime import datetime

class Report:
    def __init__(
        self,
        reporter_id,           # 檢舉人 (學生 ID)
        reported_type,         # "review" / "comment" / "teammate_post"
        reported_id,           # 被檢舉的 Review / Comment / 貼文 ID
        reason,                # 檢舉原因
        description=None,      # 額外說明
        status="pending",      # pending / resolved / rejected
        handler_id=None,       # 處理的管理員 ID
        resolution=None,       # 處理結果 (e.g. "deleted", "hidden", "warned")
        created_at=None,
        updated_at=None
    ):
        self.reporter_id = reporter_id
        self.reported_type = reported_type
        self.reported_id = reported_id
        self.reason = reason
        self.description = description
        self.status = status
        self.handler_id = handler_id
        self.resolution = resolution
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "reporter_id": self.reporter_id,
            "reported_type": self.reported_type,
            "reported_id": self.reported_id,
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "handler_id": self.handler_id,
            "resolution": self.resolution,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
