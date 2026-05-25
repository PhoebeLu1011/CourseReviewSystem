import bcrypt
import re
import jwt  # 👈 引入 PyJWT
from datetime import datetime, timedelta, timezone
from models.user import Student
from repository.student_repository import StudentRepository

class AuthService:
    def __init__(self, student_repo: StudentRepository):
        self.student_repo = student_repo
        # 🔑 設定一把只有後端知道的祕密鑰匙（實務上會放環境變數，這裡先寫死方便你們專題報告）
        self.JWT_SECRET = "your_super_secret_key_12345" 
        self.JWT_ALGORITHM = "HS256"

    def register_student(self, student_data: dict):
        """ 學生註冊（保持不變） """
        if self.student_repo.find_by_email(student_data.get("email")):
            return {"success": False, "message": "該 Email 已被註冊"}
        if self.student_repo.find_by_id(student_data.get("studentID")):
            return {"success": False, "message": "該學號已被註冊"}
        student_id = student_data.get("studentID", "").strip()
        id_pattern = r"^\d{8}[A-Z]$"
        if not re.match(id_pattern, student_id):
            return {
                "success": False, 
                "message": "註冊失敗：學號格式不正確"
            }

        raw_password = student_data.get("password")
        if not raw_password or len(raw_password) < 6:
            return {"success": False, "message": "密碼長度必須至少 6 位數"}
            
        hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        new_student = Student(
            id=None,
            name=student_data.get("name"),
            email=student_data.get("email"),
            password=hashed_password,
            studentID=student_data.get("studentID"),
            department=student_data.get("department", ""),
            profilePicURL=student_data.get("profilePicURL", "")
        )

        try:
            self.student_repo.save(new_student)
            return {"success": True, "message": "註冊成功！"}
        except Exception as e:
            return {"success": False, "message": f"資料庫寫入失敗: {str(e)}"}

    def login_student(self, email: str, input_password: str):
        """ 學生登入（驗證密碼成功後，發行 JWT Token） """
        student = self.student_repo.find_by_email(email)
        if not student:
            return {"success": False, "message": "找不到該帳號，請先註冊"}

        is_password_correct = bcrypt.checkpw(
            input_password.encode('utf-8'), 
            student.password.encode('utf-8')
        )

        if not is_password_correct:
            return {"success": False, "message": "密碼錯誤，請重新輸入"}

        # 🎫 製作 JWT 通行證的內容 (Payload)
        payload = {
            "studentID": student.studentID,                     # 放學號識別身分
            "email": student.email,
            "exp": datetime.now(timezone.utc) + timedelta(days=1) # 設定通行證 1 天後過期
        }

        # 🔒 使用鑰匙與演算法加密，產生 Token 字串
        token = jwt.encode(payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)
        student_data = student.to_dict()
        if "password" in student_data:
            del student_data["password"]
        return {
            "success": True, 
            "message": "登入成功", 
            "token": token,  # 👈 把這張萬用通行證塞給前端！
            "student": student_data
        }