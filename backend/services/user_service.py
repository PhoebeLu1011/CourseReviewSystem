
from repository.student_repository import StudentRepository

class UserService:
    def __init__(self, student_repo: StudentRepository):
        self.student_repo = student_repo

    def get_profile(self, student_id: str):
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {"success": False, "message": "找不到該學生資料"}
        return {"success": True, "data": student.to_dict()}
        
    def update_profile(self, student_id: str, update_data: dict):
        pass