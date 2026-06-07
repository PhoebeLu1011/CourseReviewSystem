from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError


class PasswordService:
    """
    Encapsulates password hashing and verification.
    """

    def __init__(self):
        self.hasher = PasswordHasher(
            time_cost=2,
            memory_cost=19456,
            parallelism=1
        )

    def hash_password(self, raw_password: str) -> str:
        if not raw_password:
            raise ValueError("Password is required.")

        return self.hasher.hash(raw_password)

    def verify_password(self, raw_password: str, hashed_password: str) -> bool:
        if not raw_password or not hashed_password:
            return False

        try:
            return self.hasher.verify(hashed_password, raw_password)
        except (VerifyMismatchError, VerificationError):
            return False