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
            "visibilityState",
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

    def _visible_query(self, query):
        return {
            "$and": [
                query,
                {
                    "$or": [
                        {"visibilityState": "VISIBLE"},
                        {"visibilityState": {"$exists": False}},
                    ]
                },
            ]
        }

    def find_by_id(self, group_id: str):
        data = self.collection.find_one(
            self._visible_query({"group_id": group_id})
        )
        return self._to_group(data)

    def find_by_id_or_legacy_id(self, group_id: str):
        data = self.collection.find_one({"group_id": group_id})

        if not data:
            data = self.collection.find_one({"groupID": group_id})

        return self._to_group(data)

    def find_all(self) -> list[Group]:
        cursor = self.collection.find(self._visible_query({}))

        groups = []
        for data in cursor:
            group = self._to_group(data)
            if group:
                groups.append(group)

        return groups

    def find_by_course(self, course_id: str) -> list[Group]:
        cursor = self.collection.find(
            self._visible_query({"course_id": course_id})
        )

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
            "$and": [
                {
                    "course_id": course_id,
                    "members": student_id,
                },
                {
                    "$or": [
                        {"visibilityState": "VISIBLE"},
                        {"visibilityState": {"$exists": False}},
                    ]
                },
            ]
        })

        return self._to_group(data)

    def delete_by_id(self, group_id: str):
        self._update_visibility(group_id, "DELETED")

    def hide_by_id(self, group_id: str):
        self._update_visibility(group_id, "HIDDEN")

    def _update_visibility(self, group_id: str, visibility_state: str):
        update = {"$set": {"visibilityState": visibility_state}}

        result = self.collection.update_one({"group_id": group_id}, update)
        if result.matched_count:
            return

        self.collection.update_one({"groupID": group_id}, update)

    def save(self, group: Group):
        self.collection.update_one(
            {"group_id": group.group_id},
            {"$set": group.to_dict()},
            upsert=True,
        )
