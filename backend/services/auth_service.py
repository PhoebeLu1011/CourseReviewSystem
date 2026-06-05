from models.user import Student
from repository.student_repository import StudentRepository
from services.password_service import PasswordService
from services.token_service import TokenService
from utils.student_id_parser import StudentIdParser


class AuthService:
    """
    Coordinates student registration and authentication.
    """

    def __init__(
        self,
        student_repo: StudentRepository,
        password_service: PasswordService,
        token_service: TokenService
    ):
        self.student_repo = student_repo
        self.password_service = password_service
        self.token_service = token_service

    def register_student(self, student_data: dict):
        if not student_data:
            return {
                "success": False,
                "message": "Registration data is required."
            }

        required_fields = ["name", "email", "password", "studentID"]

        for field in required_fields:
            if not student_data.get(field):
                return {
                    "success": False,
                    "message": f"{field} is required."
                }

        name = student_data.get("name", "").strip()
        email = student_data.get("email", "").strip().lower()
        raw_password = student_data.get("password", "")
        student_id = student_data.get("studentID", "").strip().upper()
        department = student_data.get("department", "").strip()
        profile_pic_url = student_data.get("avatar", "")

        try:
            parsed_student_id = StudentIdParser.parse(student_id)
            student_id = parsed_student_id["student_id"]

        except ValueError as e:
            return {
                "success": False,
                "message": f"Invalid student ID: {str(e)}"
            }

        if self.student_repo.find_by_email(email):
            return {
                "success": False,
                "message": "Email already exists."
            }

        if self.student_repo.find_by_id(student_id):
            return {
                "success": False,
                "message": "Student ID already exists."
            }

        if len(raw_password) < 6:
            return {
                "success": False,
                "message": "Password must contain at least 6 characters."
            }

        try:
            hashed_password = self.password_service.hash_password(raw_password)

            new_student = Student(
                id=None,
                name=name,
                email=email,
                password=hashed_password,
                department=department,
                studentID=student_id,
                avatar=profile_pic_url
            )

            self.student_repo.save(new_student)

            token = self.token_service.generate_student_token(new_student)

            user_data = new_student.to_dict()
            user_data.pop("password", None)

            return {
                "success": True,
                "message": "Registration successful.",
                "token": token,
                "user": user_data,
                "student": user_data
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Registration failed: {str(e)}"
            }

    def login_student(self, email: str, input_password: str):
        if not email or not input_password:
            return {
                "success": False,
                "message": "Email and password are required."
            }

        email = email.strip().lower()

        student = self.student_repo.find_by_email(email)

        if not student:
            return {
                "success": False,
                "message": "Account not found."
            }

        is_password_correct = self.password_service.verify_password(
            raw_password=input_password,
            hashed_password=student.password
        )

        if not is_password_correct:
            return {
                "success": False,
                "message": "Invalid password."
            }

        token = self.token_service.generate_student_token(student)

        user_data = student.to_dict()
        user_data.pop("password", None)

        return {
            "success": True,
            "message": "Login successful.",
            "token": token,
            "user": user_data,
            "student": user_data
        }

    def login_admin(self, account: str, input_password: str):
        if not account or not input_password:
            return {
                "success": False,
                "message": "Admin account and password are required."
            }

        account = account.strip()

        admin = self.student_repo.find_admin_by_account(account)

        if not admin:
            return {
                "success": False,
                "message": "Admin account not found."
            }

        hashed_password = admin.get("password_hash") or admin.get("password")

        if not hashed_password:
            return {
                "success": False,
                "message": "Admin password is missing."
            }

        is_password_correct = self.password_service.verify_password(
            raw_password=input_password,
            hashed_password=hashed_password
        )

        if not is_password_correct:
            return {
                "success": False,
                "message": "Invalid admin password."
            }

        token = self.token_service.generate_admin_token(admin)

        user_data = {
            "id": str(admin.get("_id")),
            "account": admin.get("account"),
            "email": admin.get("email"),
            "name": admin.get("name", "Admin"),
            "role": "Admin",
        }

        return {
            "success": True,
            "message": "Admin login successful.",
            "token": token,
            "user": user_data
        }

    def verify_token(self, token: str):
        return self.token_service.verify_token(token)