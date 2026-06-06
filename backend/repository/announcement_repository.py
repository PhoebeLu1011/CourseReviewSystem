from models.announcement import Announcement
from datetime import datetime

class AnnouncementRepository:
    def __init__(self, db):
        self.collection = db["announcements"]

    def find_all(self):
        """取得所有公告（最新優先）"""
        cursor = self.collection.find().sort("created_at", -1)
        announcements = []
        for data in cursor:
            data.pop("_id", None)  # 修正：清除 MongoDB _id，避免 Announcement() 崩潰
            announcements.append(Announcement(**data))
        return announcements

    def find_by_id(self, announcement_id: str):
        """取得單一公告"""
        data = self.collection.find_one({"announcementID": announcement_id})
        if not data:
            return None
        data.pop("_id", None)
        return Announcement(**data)

    def save(self, announcement: Announcement):
        """新增或更新公告"""
        self.collection.update_one(
            {"announcementID": announcement.announcementID},
            {"$set": announcement.to_dict()},
            upsert=True
        )

    def delete_by_id(self, announcement_id: str):
        """刪除公告"""
        self.collection.delete_one({"announcementID": announcement_id})
