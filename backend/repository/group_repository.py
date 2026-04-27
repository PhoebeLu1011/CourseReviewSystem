from models.group import Group

class GroupRepository:
    def __init__(self, db):
        self.collection = db["groups"]
 
    def find_by_id(self, group_id):
        data = self.collection.find_one({"group_id": group_id})
        if not data:
            return None
        data.pop("_id", None)
        return Group(**data)
 
    def save(self, group: Group):
        self.collection.update_one(
            {"group_id": group.group_id},
            {"$set": group.to_dict()},
            upsert=True
        )