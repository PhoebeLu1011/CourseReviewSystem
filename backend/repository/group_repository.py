from models.group import Group
from datetime import datetime

class GroupRepository:
    def __init__(self, db):
        self.collection = db["groups"]
    #database -> object
    def _to_group(self, data):
        if not data:
            return None

        data.pop("_id", None)

        if isinstance(data.get("recruitment_deadline"), str):
            data["recruitment_deadline"] = datetime.fromisoformat(
                data["recruitment_deadline"]
            )

        return Group(**data)

    # using "group_id" to find the group
    def find_by_id(self, group_id):
        data = self.collection.find_one({"group_id": group_id})
        if not data:
            return None
        data.pop("_id", None)
        return Group(**data)
    
    #find the joinable group 
    def find_joinable_by_course(self, course_id: str) -> list[Group]:
        cursor = self.collection.find({"course_id": course_id})

        groups = []
        for data in cursor:
            group = self._to_group(data)

            if group and group.is_joinable():
                groups.append(group)

        return groups

    def save(self, group: Group):
        self.collection.update_one(
            {"group_id": group.group_id},
            {"$set": group.to_dict()},
            upsert=True
        )