from dataclasses import dataclass
from functools import wraps

from flask import g, jsonify, request


@dataclass(frozen=True)
class AuthenticatedIdentity:
    subject_id: str
    role: str
    payload: dict

    @property
    def is_admin(self) -> bool:
        return self.role.lower() == "admin"

    @property
    def is_student(self) -> bool:
        return self.role.lower() == "student"


class AuthorizationService:
    """Authenticates requests and exposes a trusted request identity."""

    CONTEXT_KEY = "authenticated_identity"

    def __init__(self, token_service):
        self.token_service = token_service

    def require_student(self, view_function):
        return self._require_role(view_function, "student")

    def require_admin(self, view_function):
        return self._require_role(view_function, "admin")

    def current_identity(self) -> AuthenticatedIdentity:
        identity = getattr(g, self.CONTEXT_KEY, None)
        if not identity:
            raise RuntimeError("Authenticated identity is not available.")
        return identity

    def current_student_id(self) -> str:
        identity = self.current_identity()
        if not identity.is_student:
            raise RuntimeError("Authenticated identity is not a student.")
        return identity.subject_id

    def _require_role(self, view_function, required_role: str):
        @wraps(view_function)
        def wrapped(*args, **kwargs):
            verification = self.token_service.verify_token(
                request.headers.get("Authorization")
            )

            if not verification.get("success"):
                return jsonify({
                    "message": verification.get("message", "Authentication failed.")
                }), 401

            try:
                identity = self._identity_from_payload(verification["payload"])
            except ValueError as error:
                return jsonify({"message": str(error)}), 401

            if identity.role.lower() != required_role.lower():
                return jsonify({"message": "Permission denied."}), 403

            setattr(g, self.CONTEXT_KEY, identity)
            return view_function(*args, **kwargs)

        return wrapped

    @staticmethod
    def _identity_from_payload(payload: dict) -> AuthenticatedIdentity:
        role = str(payload.get("role", "")).strip()
        subject_id = payload.get("studentID") if role.lower() == "student" else payload.get("id")

        if not role or not subject_id:
            raise ValueError("Token payload is missing identity information.")

        return AuthenticatedIdentity(
            subject_id=str(subject_id),
            role=role,
            payload=payload,
        )
