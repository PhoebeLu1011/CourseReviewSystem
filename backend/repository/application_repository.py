from models.application import Application


class ApplicationRepository:
    def __init__(self, db):
        self.collection = db["applications"]

    def find_by_id(self, application_id):
        data = self.collection.find_one({"application_id": application_id})
        if not data:
            return None
        return Application(**data)

    def save(self, application: Application):
        self.collection.update_one(
            {"application_id": application.application_id},
            {"$set": application.to_dict()},
            upsert=True
        )

    def find_pending_by_student(self, student_id: str):
        results = self.collection.find({
            "student_id": student_id,
            "status": "pending"
        })
        return [Application(**data) for data in results]

    def find_pending_by_group(self, group_id: str):
        results = self.collection.find({
            "group_id": group_id,
            "status": "pending"
        })
        return [Application(**data) for data in results]