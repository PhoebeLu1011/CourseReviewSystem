from models.announcement import Announcement, AnnouncementQuery


class AnnouncementRepository:
    def __init__(self, db):
        self.collection = db["announcements"]

    def find(self, query: AnnouncementQuery):
        conditions = []
        if not query.include_deleted:
            conditions.append({
                "$or": [
                    {"visibilityState": "VISIBLE"},
                    {"visibilityState": {"$exists": False}},
                ]
            })
        if query.target:
            conditions.append({"target": query.target})
        if query.published_only:
            now = query.now.isoformat()
            conditions.append({
                "$or": [
                    {"scheduled_at": None},
                    {"scheduled_at": {"$exists": False}},
                    {"scheduled_at": {"$lte": now}},
                ]
            })

        mongo_query = {"$and": conditions} if conditions else {}
        cursor = self.collection.find(mongo_query).sort(
            [("is_pinned", -1), ("created_at", -1)]
        )
        return [self._to_announcement(data) for data in cursor]

    def find_by_id(self, announcement_id: str):
        data = self.collection.find_one({"announcementID": announcement_id})
        return self._to_announcement(data)

    def count_active(self):
        return self.collection.count_documents({
            "$or": [
                {"visibilityState": "VISIBLE"},
                {"visibilityState": {"$exists": False}},
            ]
        })

    def save(self, announcement: Announcement):
        self.collection.update_one(
            {"announcementID": announcement.announcementID},
            {"$set": announcement.to_dict()},
            upsert=True,
        )

    @staticmethod
    def _to_announcement(data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Announcement(**data)
