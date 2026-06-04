from datetime import datetime
from models.group import Group


class GroupRepository:
    def __init__(self, db):
        self.collection = db["groups"]

    def _to_group(self, data):
        if not data:
            return None

        data = dict(data)
        data.pop("_id", None)

        allowed_keys = {
            "group_id",
            "group_name",
            "course_id",
            "leader_id",
            "max_members",
            "members",
            "status",
            "recruitment_deadline",
            "description",
            "tags",
        }

        data = {
            key: value
            for key, value in data.items()
            if key in allowed_keys
        }

        deadline = data.get("recruitment_deadline")

        if isinstance(deadline, str) and deadline.strip():
            data["recruitment_deadline"] = datetime.fromisoformat(deadline)

        return Group(**data)

    def find_by_id(self, group_id: str):
        data = self.collection.find_one({"group_id": group_id})
        return self._to_group(data)

    def find_all(self) -> list[Group]:
        cursor = self.collection.find({})

        groups = []
        for data in cursor:
            group = self._to_group(data)
            if group:
                groups.append(group)

        return groups

    def find_by_course(self, course_id: str) -> list[Group]:
        cursor = self.collection.find({"course_id": course_id})

        groups = []
        for data in cursor:
            group = self._to_group(data)
            if group:
                groups.append(group)

        return groups

    def find_joinable_by_course(self, course_id: str | None = None) -> list[Group]:
        if course_id:
            groups = self.find_by_course(course_id)
        else:
            groups = self.find_all()

        return [group for group in groups if group.is_joinable()]

    def find_all_joinable(self) -> list[Group]:
        return self.find_joinable_by_course(None)

    def find_by_course_and_member(self, course_id: str, student_id: str):
        data = self.collection.find_one({
            "course_id": course_id,
            "members": student_id,
        })

        return self._to_group(data)

    def save(self, group: Group):
        self.collection.update_one(
            {"group_id": group.group_id},
            {"$set": group.to_dict()},
            upsert=True,
        )