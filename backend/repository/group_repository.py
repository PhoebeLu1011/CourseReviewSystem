from datetime import datetime, timezone
from models.group import Group
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument


class GroupRepository:
    def __init__(self, db):
        self.collection = db["groups"]
        self.membership_collection = db["group_memberships"]

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

        return self._to_groups(cursor)

    def find_by_leader(self, leader_id: str) -> list[Group]:
        cursor = self.collection.find(
            self._visible_query({"leader_id": leader_id})
        )
        return self._to_groups(cursor)

    def find_by_member(self, student_id: str) -> list[Group]:
        cursor = self.collection.find(
            self._visible_query({"members": student_id})
        )
        return self._to_groups(cursor)

    def _to_groups(self, cursor) -> list[Group]:
        groups = []
        for data in cursor:
            group = self._to_group(data)
            if group:
                groups.append(group)

        return groups

    def find_joinable_by_course(self, course_id: str | None = None) -> list[Group]:
        query = {
            "status": "open",
            "$expr": {
                "$lt": [
                    {"$size": {"$ifNull": ["$members", []]}},
                    "$max_members",
                ]
            },
        }
        if course_id:
            query["course_id"] = course_id

        # MongoDB removes closed/full groups first; the domain model handles deadline details.
        groups = self._to_groups(
            self.collection.find(self._visible_query(query))
        )
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
            {"$set": group.to_persistence_dict()},
            upsert=True,
        )

    def claim_course_membership(
        self,
        course_id: str,
        student_id: str,
        group_id: str,
    ) -> bool:
        existing_group = self.find_by_course_and_member(course_id, student_id)
        if existing_group and existing_group.group_id != group_id:
            return False

        try:
            self.membership_collection.insert_one({
                "course_id": course_id,
                "student_id": student_id,
                "group_id": group_id,
            })
            return True
        except DuplicateKeyError:
            return False

    def release_course_membership(
        self,
        course_id: str,
        student_id: str,
        group_id: str,
    ) -> None:
        self.membership_collection.delete_one({
            "course_id": course_id,
            "student_id": student_id,
            "group_id": group_id,
        })

    def release_group_memberships(self, group_id: str) -> None:
        self.membership_collection.delete_many({"group_id": group_id})

    def add_member_if_joinable(self, group_id: str, student_id: str):
        now = datetime.now(timezone.utc)
        query = self._visible_query({
            "group_id": group_id,
            "status": "open",
            "members": {"$ne": student_id},
            "$expr": {"$lt": [{"$size": "$members"}, "$max_members"]},
            "$or": [
                {"recruitment_deadline": None},
                {"recruitment_deadline": {"$exists": False}},
                {"recruitment_deadline": {"$gte": now}},
                {"recruitment_deadline": {"$gte": now.isoformat()}},
            ],
        })
        data = self.collection.find_one_and_update(
            query,
            {"$addToSet": {"members": student_id}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def remove_member_if_present(self, group_id: str, student_id: str):
        data = self.collection.find_one_and_update(
            {"group_id": group_id, "members": student_id},
            {"$pull": {"members": student_id}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def close_if_full(self, group_id: str):
        data = self.collection.find_one_and_update(
            {
                "group_id": group_id,
                "$expr": {"$gte": [{"$size": "$members"}, "$max_members"]},
            },
            {"$set": {"status": "closed"}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def update_recruitment_status(self, group_id: str, status: str):
        data = self.collection.find_one_and_update(
            self._visible_query({"group_id": group_id}),
            {"$set": {"status": status}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def update_group_info(self, group: Group):
        data = self.collection.find_one_and_update(
            self._visible_query({"group_id": group.group_id}),
            {
                "$set": {
                    "group_name": group.group_name,
                    "max_members": group.max_members,
                    "recruitment_deadline": group.recruitment_deadline,
                    "description": group.description,
                    "tags": group.tags,
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def update_leader(self, group_id: str, new_leader_id: str):
        data = self.collection.find_one_and_update(
            self._visible_query({
                "group_id": group_id,
                "members": new_leader_id,
            }),
            {"$set": {"leader_id": new_leader_id}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)

    def dissolve(self, group_id: str):
        data = self.collection.find_one_and_update(
            self._visible_query({"group_id": group_id}),
            {
                "$set": {
                    "status": "closed",
                    "visibilityState": "DELETED",
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        return self._to_group(data)
