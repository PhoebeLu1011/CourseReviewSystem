from models.user import Student

class StudentRepository:
    def __init__(self,db):
        self.collection = db["users"]
    
    def find_by_id(self, student_id):
        data = self.collection.find_one(
            {"studentID":student_id}
        )
        if not data: return None

        data.pop("_id", None)
        return Student(**data)
    
    def save(self, student: Student):
        self.collection.update_one(
            {"studentID": student.studentID},
            {"$set": student.to_dict()},
            upsert=True
        )
    def find_by_email(self, email: str):
        data = self.collection.find_one({"email": email})
        if not data:
            return None
        data.pop("_id", None)
        return Student(**data)