from models.schedule import ScheduledCourse


class ScheduleRepository:
    def __init__(self, db):
        self.collection = db["schedules"]

    def find_by_user(self, user_id):
        cursor = self.collection.find({"userId": user_id}).sort("createdAt", 1)
        return [self._to_scheduled_course(data) for data in cursor]

    def find_by_user_and_course(self, user_id, course_id):
        data = self.collection.find_one({"userId": user_id, "courseId": course_id})
        return self._to_scheduled_course(data)

    def upsert(self, scheduled_course):
        data = scheduled_course.to_persistence_dict()
        self.collection.update_one(
            {"_id": self._compound_id(scheduled_course.userId, scheduled_course.courseId)},
            {"$set": data},
            upsert=True,
        )
        return scheduled_course

    def replace_for_user(self, user_id, scheduled_courses):
        self.collection.delete_many({"userId": user_id})
        if not scheduled_courses:
            return []
        documents = []
        for scheduled_course in scheduled_courses:
            data = scheduled_course.to_persistence_dict()
            data["_id"] = self._compound_id(user_id, scheduled_course.courseId)
            documents.append(data)
        self.collection.insert_many(documents)
        return scheduled_courses

    def delete(self, user_id, course_id):
        result = self.collection.delete_one({"userId": user_id, "courseId": course_id})
        return result.deleted_count > 0

    @staticmethod
    def _compound_id(user_id, course_id):
        return f"{user_id}:{course_id}"

    @staticmethod
    def _to_scheduled_course(data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return ScheduledCourse(
            userId=data.get("userId"),
            courseId=data.get("courseId") or data.get("courseID"),
            serialNumber=data.get("serialNumber", ""),
            title=data.get("title", ""),
            department=data.get("department", ""),
            credits=data.get("credits", 0),
            professor=data.get("professor", ""),
            schedule=data.get("schedule", ""),
            location=data.get("location", ""),
            days=data.get("days", []),
            timeSlot=data.get("timeSlot", ""),
            createdAt=data.get("createdAt"),
        )
