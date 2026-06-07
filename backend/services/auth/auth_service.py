import re
from dataclasses import dataclass

from models.user import Student
from utils.student_id_parser import StudentIdParser


class AuthenticationError(ValueError):
    pass


class RegistrationConflictError(ValueError):
    pass


@dataclass(frozen=True)
class AuthenticationResult:
    token: str
    user: dict
    message: str

    def to_dict(self):
        return {
            "success": True,
            "message": self.message,
            "token": self.token,
            "user": self.user,
            "student": self.user if self.user.get("role", "").lower() == "student" else None,
        }


class StudentRegistrationFactory:
    """Validates registration input and builds a Student."""

    EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def __init__(self, password_service, student_id_parser=StudentIdParser):
        self.password_service = password_service
        self.student_id_parser = student_id_parser

    def create(self, data):
        if not isinstance(data, dict):
            raise ValueError("Registration data is required.")

        name = self._required_text(data.get("name"), "name")
        email = self._required_text(data.get("email"), "email").lower()
        password = self._required_text(data.get("password"), "password")
        student_id = self._required_text(data.get("studentID"), "studentID").upper()
        department = self._required_text(data.get("department"), "department")

        if not self.EMAIL_PATTERN.match(email):
            raise ValueError("Invalid email format.")
        if len(password) < 6:
            raise ValueError("Password must contain at least 6 characters.")

        try:
            student_id = self.student_id_parser.parse(student_id)["student_id"]
        except ValueError as error:
            raise ValueError(f"Invalid student ID: {error}") from error

        return Student(
            id=None,
            name=name,
            email=email,
            password=self.password_service.hash_password(password),
            department=department,
            studentID=student_id,
            avatar=data.get("avatar", ""),
        )

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()


class StudentLoginStrategy:
    role = "student"

    def __init__(self, student_repo, password_service, token_service):
        self.student_repo = student_repo
        self.password_service = password_service
        self.token_service = token_service

    def authenticate(self, credential, password):
        email = str(credential or "").strip().lower()
        if not email or not password:
            raise AuthenticationError("Email and password are required.")

        student = self.student_repo.find_by_email(email)
        if not student or not self.password_service.verify_password(password, student.password):
            raise AuthenticationError("Invalid email or password.")

        return AuthenticationResult(
            token=self.token_service.generate_student_token(student),
            user=student.to_public_dict(),
            message="Login successful.",
        )


class AdminLoginStrategy:
    role = "admin"

    def __init__(self, student_repo, password_service, token_service):
        self.student_repo = student_repo
        self.password_service = password_service
        self.token_service = token_service

    def authenticate(self, credential, password):
        account = str(credential or "").strip()
        if not account or not password:
            raise AuthenticationError("Admin account and password are required.")

        admin = self.student_repo.find_admin_by_account(account)
        hashed_password = (admin or {}).get("password_hash") or (admin or {}).get("password")
        if not admin or not hashed_password or not self.password_service.verify_password(password, hashed_password):
            raise AuthenticationError("Invalid admin account or password.")

        return AuthenticationResult(
            token=self.token_service.generate_admin_token(admin),
            user={
                "id": str(admin.get("_id")),
                "account": admin.get("account"),
                "email": admin.get("email"),
                "name": admin.get("name", "Admin"),
                "role": "Admin",
            },
            message="Admin login successful.",
        )


class AuthService:
    def __init__(
        self,
        student_repo,
        password_service,
        token_service,
        registration_factory=None,
        login_strategies=None,
    ):
        self.student_repo = student_repo
        self.token_service = token_service
        self.registration_factory = registration_factory or StudentRegistrationFactory(
            password_service
        )
        strategies = login_strategies or [
            StudentLoginStrategy(student_repo, password_service, token_service),
            AdminLoginStrategy(student_repo, password_service, token_service),
        ]
        self.login_strategies = {strategy.role: strategy for strategy in strategies}

    def register_student(self, student_data):
        student = self.registration_factory.create(student_data)

        # Generate the token before persistence so a token failure cannot leave a half-finished signup.
        token = self.token_service.generate_student_token(student)
        if not self.student_repo.insert_if_absent(student):
            raise RegistrationConflictError("Email or student ID already exists.")

        return AuthenticationResult(
            token=token,
            user=student.to_public_dict(),
            message="Registration successful.",
        )

    def login(self, role, credential, password):
        strategy = self.login_strategies.get(str(role or "").strip().lower())
        if not strategy:
            raise ValueError("Role must be student or admin.")
        return strategy.authenticate(credential, password)

    def login_student(self, email, input_password):
        return self.login("student", email, input_password)

    def login_admin(self, account, input_password):
        return self.login("admin", account, input_password)
