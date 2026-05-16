# services/admin_service.py
try:
    from ..models.user import Student
    from ..repository.student_repository import StudentRepository
except ImportError:
    # allow running within backend/ directly or as a package
    from models.user import Student
    from repository.student_repository import StudentRepository

class AuthService:
    def __init__(self, student_repo: StudentRepository):
        # 組合組員寫好的 Repository
        self.student_repo = student_repo

    def register_student(self, student_data: dict):
        """
        註冊功能：接收前端傳來的註冊資料
        """
        # 1. 這裡可以先做一些驗證（例如密碼長度、Email格式等）
        
        # 2. 呼叫組員定義的 Student Model 來建立物件
        new_student = Student(
            id=None, # 由 MongoDB 自動生成，這裡先帶 None 或在 Repo 處理
            name=student_data.get("name"),
            email=student_data.get("email"),
            profilePicURL=student_data.get("profilePicURL", ""),
            department=student_data.get("department"),
            studentID=student_data.get("studentID") # 👈 你的核心需求：學號！
        )
        
        # 3. 呼叫組員寫好的 save 功能，直接寫入 MongoDB
        try:
            self.student_repo.save(new_student)
            return {"success": True, "message": "註冊成功", "studentID": new_student.studentID}
        except Exception as e:
            return {"success": False, "message": f"註冊失敗: {str(e)}"}

    def get_profile(self, student_id):
        """
        帳號管理/個人資料讀取
        """
        # 直接呼叫組員寫好的 find_by_id
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {"success": False, "message": "找不到該學生"}
        
        # 呼叫組員在 Model 裡寫好的 to_dict() 方法，直接轉成 JSON 格式
        return {"success": True, "data": student.to_dict()}