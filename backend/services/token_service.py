import os
import jwt

from datetime import datetime, timedelta, timezone


class TokenService:
    """
    Handles JWT generation and validation.
    """

    def __init__(self):
        self.JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_key")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.JWT_EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "1"))

    def generate_student_token(self, student) -> str:
        now = datetime.now(timezone.utc)

        payload = {
            "studentID": student.studentID,
            "email": student.email,
            "role": student.role,
            "iat": now,
            "exp": now + timedelta(days=self.JWT_EXPIRE_DAYS)
        }

        return jwt.encode(
            payload,
            self.JWT_SECRET,
            algorithm=self.JWT_ALGORITHM
        )

    def generate_admin_token(self, admin: dict) -> str:
        now = datetime.now(timezone.utc)

        payload = {
            "id": str(admin.get("_id")),
            "account": admin.get("account"),
            "email": admin.get("email"),
            "role": "Admin",
            "iat": now,
            "exp": now + timedelta(days=self.JWT_EXPIRE_DAYS)
        }

        return jwt.encode(
            payload,
            self.JWT_SECRET,
            algorithm=self.JWT_ALGORITHM
        )

    def verify_token(self, token: str) -> dict:
        if not token:
            return {
                "success": False,
                "message": "Token is required."
            }

        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "", 1)

        try:
            payload = jwt.decode(
                token,
                self.JWT_SECRET,
                algorithms=[self.JWT_ALGORITHM]
            )

            return {
                "success": True,
                "payload": payload
            }

        except jwt.ExpiredSignatureError:
            return {
                "success": False,
                "message": "Token has expired."
            }

        except jwt.InvalidTokenError:
            return {
                "success": False,
                "message": "Invalid token."
            }
