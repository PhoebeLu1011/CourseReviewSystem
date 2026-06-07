from models.application import Application
from datetime import datetime
from pymongo.errors import DuplicateKeyError


class ApplicationRepository:
    def __init__(self, db):
        self.collection = db["applications"]

    def find_by_id(self, application_id):
        data = self.collection.find_one({"application_id": application_id})
        if not data:
            return None

        data.pop("_id", None)
        return Application(**data)

    def save(self, application: Application):
        self.collection.update_one(
            {"application_id": application.application_id},
            {"$set": application.to_dict()},
            upsert=True
        )

    def hard_delete_by_id(self, application_id: str):
        """Only used to compensate a failed submission workflow."""
        self.collection.delete_one({"application_id": application_id})

    def insert_pending(self, application: Application) -> bool:
        try:
            self.collection.insert_one(application.to_dict())
            return True
        except DuplicateKeyError:
            return False

    def find_pending_by_student(self, student_id: str):
        results = self.collection.find({
            "student_id": student_id,
            "status": "pending"
        })

        return self._to_applications(results)

    def find_by_student(self, student_id: str):
        results = self.collection.find({"student_id": student_id})
        return self._to_applications(results)

    def _to_applications(self, results):
        applications = []
        for data in results:
            data.pop("_id", None)
            applications.append(Application(**data))

        return applications

    def find_pending_by_group(self, group_id: str):
        results = self.collection.find({
            "group_id": group_id,
            "status": "pending"
        })
        return self._to_applications(results)

    def find_pending_by_groups(self, group_ids: list[str]) -> dict[str, list[Application]]:
        grouped = {group_id: [] for group_id in group_ids}
        if not group_ids:
            return grouped

        results = self.collection.find({
            "group_id": {"$in": group_ids},
            "status": "pending",
        })
        for application in self._to_applications(results):
            grouped.setdefault(application.group_id, []).append(application)
        return grouped

    def find_pending_by_student_and_course(
        self,
        student_id: str,
        course_id: str
    ):
        results = self.collection.find({
            "student_id": student_id,
            "course_id": course_id,
            "status": "pending"
        })
        return self._to_applications(results)

    def reject_pending_by_group(self, group_id: str, reason: str) -> int:
        result = self.collection.update_many(
            {"group_id": group_id, "status": "pending"},
            {
                "$set": {
                    "status": "rejected",
                    "reject_reason": reason,
                    "reviewed_time": datetime.now(),
                }
            },
        )
        return result.modified_count
