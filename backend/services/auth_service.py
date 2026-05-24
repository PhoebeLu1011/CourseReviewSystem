from models.user import Student
from repository.student_repository import StudentRepository

class AuthService:
    def __init__(self, student_repo: StudentRepository):
        self.student_repo = student_repo

    def register_student(self, student_data: dict):
        """ Use Case: 學生註冊 """
        existing_student = self.student_repo.find_by_email(student_data.get("email"))
        if existing_student:
            return {"success": False, "message": "該 Email 已被註冊"}

        existing_id = self.student_repo.find_by_id(student_data.get("studentID"))
        if existing_id:
            return {"success": False, "message": "該學號已被註冊"}

        new_student = Student(
            id=None,
            name=student_data.get("name"),
            email=student_data.get("email"),
            profilePicURL=student_data.get("profilePicURL", ""),
            department=student_data.get("department"),
            studentID=student_data.get("studentID")
        )

        try:
            self.student_repo.save(new_student)
            return {"success": True, "message": "註冊成功！"}
        except Exception as e:
            return {"success": False, "message": f"資料庫寫入失敗: {str(e)}"}

    def login_student(self, email: str):
        """ Use Case 2: 學生登入 """
        # 這裡示範簡易登入邏輯（如果專案之後有加密碼，要在這裡驗證密碼）
        student = self.student_repo.find_by_email(email)
        if not student:
            return {"success": False, "message": "找不到該帳號，請先註冊"}
        
        return {
            "success": True, 
            "message": "登入成功", 
            "student": student.to_dict() 
        }
