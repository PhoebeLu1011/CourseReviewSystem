import jwt
from repository.student_repository import StudentRepository

class UserService:
    def __init__(self, student_repo: StudentRepository):
        self.student_repo = student_repo
        self.JWT_SECRET = "your_super_secret_key_12345" 
        self.JWT_ALGORITHM = "HS256"

    def verify_token(self, token: str):
        """ 驗證 Token 是否合法的核心工具 """
        try:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]
                
            decoded = jwt.decode(token, self.JWT_SECRET, algorithms=[self.JWT_ALGORITHM])
            return {"success": True, "studentID": decoded["studentID"]}
        except jwt.ExpiredSignatureError:
            return {"success": False, "message": "通行證已過期，請重新登入"}
        except jwt.InvalidTokenError:
            return {"success": False, "message": "無效的通行證，拒絕訪問"}

    def get_profile(self, token: str):
        """ 帳號管理：憑著通行證 (Token) 來獲取個人資料 """
        
        auth_result = self.verify_token(token)
        if not auth_result["success"]:
            return auth_result 

        
        student_id = auth_result["studentID"]

       
        student = self.student_repo.find_by_id(student_id)
        if not student:
            return {"success": False, "message": "找不到該學生資料"}
            
        return {"success": True, "data": student.to_dict()}