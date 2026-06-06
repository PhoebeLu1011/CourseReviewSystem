from repository.student_repository import StudentRepository
from services.auth_service import AuthService
from bson.objectid import ObjectId
from flask import send_file
import io

class UserService:
    """
    Handles authenticated user profile operations.
    """

    def __init__(
        self,
        student_repo: StudentRepository,
        auth_service: AuthService,
        fs=None
    ):
        self.student_repo = student_repo
        self.auth_service = auth_service
        self.fs = fs

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

    
    def update_profile(self, token: str, student_id: str, data: dict):
        """
        Updates the student profile after verifying the token and ownership.
        """
       
        verify_result = self.auth_service.verify_token(token)
        if not verify_result["success"]:
            return verify_result

        
        payload = verify_result["payload"]
        token_student_id = payload.get("studentID")
        if token_student_id != student_id:
            return {
                "success": False,
                "message": "Permission denied. You can only update your own profile."
            }

        
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {
                "success": False,
                "message": "User not found."
            }

        
        if "name" in data:
            student.name = data["name"]
        if "bio" in data:
            student.bio = data["bio"]
        if "birthday" in data:
            student.birthday = data["birthday"]
        if "interests" in data:
            student.interests = data["interests"]

        
        self.student_repo.save(student)

        return {
            "success": True,
            "message": "Profile updated successfully."
        }
    

    # GridFS 上傳頭像的邏輯
    def upload_avatar(self, token: str, file):
        if not file:
            return {"success": False, "message": "沒有收到檔案"}

        
        verify_result = self.auth_service.verify_token(token)
        if not verify_result["success"]:
            return verify_result

        payload = verify_result["payload"]
        student_id = payload.get("studentID")

        
        file_id = self.fs.put(
            file.read(),
            filename=file.filename,
            content_type=file.content_type
        )

        
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {"success": False, "message": "User not found."}
        
        
        student.avatar = str(file_id) 
        self.student_repo.save(student)

        return {
            "success": True,
            "message": "Avatar uploaded successfully.",
            "avatar_id": str(file_id)
        }
    def get_avatar_stream(self, file_id_str: str):
        try:
            file_id = ObjectId(file_id_str)
            grid_out = self.fs.get(file_id)
            
            return send_file(
                io.BytesIO(grid_out.read()),
                mimetype=grid_out.content_type or 'image/jpeg'
            )
        except Exception as e:
            return None