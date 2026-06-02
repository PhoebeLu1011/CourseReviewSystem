from repository.student_repository import StudentRepository
from services.auth_service import AuthService

class UserService:
    """
    Handles authenticated user profile operations.
    """

    def __init__(
        self,
        student_repo: StudentRepository,
        auth_service: AuthService
    ):
        self.student_repo = student_repo
        self.auth_service = auth_service

    def get_profile(self, token: str):
        verify_result = self.auth_service.verify_token(token)
        if not verify_result["success"]:
            return verify_result

        payload = verify_result["payload"]
        student_id = payload.get("studentID")

        if not student_id:
            return {
                "success": False,
                "message": "Token payload is missing studentID."
            }

        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {
                "success": False,
                "message": "User not found."
            }

        return {
            "success": True,
            "message": "Profile retrieved successfully.",
            "student": student.to_dict()
        }

    # 💡 新增：更新個人檔案邏輯
    def update_profile(self, token: str, student_id: str, data: dict):
        """
        Updates the student profile after verifying the token and ownership.
        """
        # 1. 驗證前端傳來的 Token 是否合法
        verify_result = self.auth_service.verify_token(token)
        if not verify_result["success"]:
            return verify_result

        # 2. 安全檢查：確保目前登入者只能改自己的資料
        payload = verify_result["payload"]
        token_student_id = payload.get("studentID")
        if token_student_id != student_id:
            return {
                "success": False,
                "message": "Permission denied. You can only update your own profile."
            }

        # 3. 撈出該名學生資料物件
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {
                "success": False,
                "message": "User not found."
            }

        # 4. 把前端有傳過來的欄位覆蓋進物件中
        if "name" in data:
            student.name = data["name"]
        if "bio" in data:
            student.bio = data["bio"]
        if "birthday" in data:
            student.birthday = data["birthday"]
        if "interests" in data:
            student.interests = data["interests"]

        # 5. 儲存回 MongoDB
        # 💡 註：此處假設你的 student_repo 有內建儲存或更新方法（例如 save 或 update）
        # 如果你的專案是用其他命名（如 update_by_id），請自行微調這一行
        self.student_repo.save(student)

        return {
            "success": True,
            "message": "Profile updated successfully."
        }