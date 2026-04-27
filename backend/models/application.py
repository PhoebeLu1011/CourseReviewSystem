from datetime import datetime


class Application:
    def __init__(
        self,
        application_id: str,
        student_id: str,
        group_id: str,
        message: str = "",
        status: str = "pending",   # pending | approved | rejected | cancelled
        apply_time: datetime | None = None,
        reviewed_time: datetime | None = None,
        reject_reason: str | None = None,
    ):
        self.application_id = application_id
        self.student_id = student_id
        self.group_id = group_id
        self.message = message
        self.status = status
        self.apply_time = apply_time or datetime.now()
        self.reviewed_time = reviewed_time
        self.reject_reason = reject_reason

        self._validate_status()

    def _validate_status(self) -> None:
        allowed_status = {"pending", "approved", "rejected", "cancelled"}
        if self.status not in allowed_status:
            raise ValueError(f"Invalid application status: {self.status}")

    def is_pending(self) -> bool:
        return self.status == "pending"

    def is_approved(self) -> bool:
        return self.status == "approved"

    def is_rejected(self) -> bool:
        return self.status == "rejected"

    def is_cancelled(self) -> bool:
        return self.status == "cancelled"

    def approve(self) -> None:
        if not self.is_pending():
            raise ValueError("Only pending applications can be approved.")

        self.status = "approved"
        self.reviewed_time = datetime.now()
        self.reject_reason = None

    def reject(self, reason: str | None = None) -> None:
        if not self.is_pending():
            raise ValueError("Only pending applications can be rejected.")

        self.status = "rejected"
        self.reviewed_time = datetime.now()
        self.reject_reason = reason

    def cancel(self) -> None:
        if not self.is_pending():
            raise ValueError("Only pending applications can be cancelled.")

        self.status = "cancelled"
        self.reviewed_time = datetime.now()

    def to_dict(self) -> dict:
        return {
            "application_id": self.application_id,
            "student_id": self.student_id,
            "group_id": self.group_id,
            "message": self.message,
            "status": self.status,
            "apply_time": self.apply_time,
            "reviewed_time": self.reviewed_time,
            "reject_reason": self.reject_reason,
        }