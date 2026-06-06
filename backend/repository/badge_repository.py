from models.badge import Badge


class BadgeRepository:
    def __init__(self, db):
        self.collection = db["badges"]

    def _to_badge(self, data):
        if not data:
            return None

        data.pop("_id", None)
        return Badge(**data)

    def find_all(self):
        results = self.collection.find()
        return [self._to_badge(data) for data in results]

    def find_by_id(self, badge_id: str):
        data = self.collection.find_one({"badgeID": badge_id})
        return self._to_badge(data)

    def save(self, badge: Badge):
        self.collection.update_one(
            {"badgeID": badge.badgeID},
            {"$set": badge.to_dict()},
            upsert=True
        )