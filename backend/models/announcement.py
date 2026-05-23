import uuid
from datetime import datetime

class Announcement:
    def __init__(
        self,
        title,
        content,
        announcementID=None,      # 新增：公告唯一 ID
        tags=None,
        target="all",
        is_pinned=False,
        scheduled_at=None,
        created_by=None,
        created_at=None
    ):
        self.announcementID = announcementID if announcementID else str(uuid.uuid4())
        self.title = title
        self.content = content
        self.tags = tags or []
        self.target = target
        self.is_pinned = is_pinned
        self.scheduled_at = scheduled_at
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "announcementID": self.announcementID,
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "target": self.target,
            "is_pinned": self.is_pinned,
            "scheduled_at": self.scheduled_at,
            "created_by": self.created_by,
            "created_at": self.created_at
        }
