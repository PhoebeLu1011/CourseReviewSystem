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