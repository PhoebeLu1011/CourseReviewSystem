from models.user import Student
from pymongo.errors import DuplicateKeyError


class StudentRepository:
    def __init__(self, db):
        self.collection = db["users"]

    def find_by_id(self, student_id):
        data = self.collection.find_one(
            {"studentID": student_id}
        )

        if not data:
            return None

        return self._to_student(data)

    def find_by_email(self, email: str):
        data = self.collection.find_one({"email": email})

        if not data:
            return None

        return self._to_student(data)

    def find_admin_by_account(self, account: str):
        return self.collection.find_one({
            "account": account,
            "role": "Admin"
        })

    def save(self, student: Student):
        self.collection.update_one(
            {"studentID": student.studentID},
            {"$set": student.to_persistence_dict()},
            upsert=True
        )

    def insert_if_absent(self, student: Student):
        try:
            self.collection.insert_one(student.to_persistence_dict())
            return True
        except DuplicateKeyError:
            return False

    @staticmethod
    def _to_student(data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Student(**data)
