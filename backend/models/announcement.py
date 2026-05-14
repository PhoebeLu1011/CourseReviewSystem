from datetime import datetime

class Announcement:
    def __init__(
        self,
        title,
        content,
        tags=None,           # 標籤列表，例如 ["重要", "活動"]
        target="all",        # "all" / "department:資訊工程" / "grade:大二"
        is_pinned=False,     # 是否置頂
        scheduled_at=None,   # 預約發布時間 (None = 立即發布)
        created_by=None,     # 管理員 ID
        created_at=None
    ):
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
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "target": self.target,
            "is_pinned": self.is_pinned,
            "scheduled_at": self.scheduled_at,
            "created_by": self.created_by,
            "created_at": self.created_at
        }
