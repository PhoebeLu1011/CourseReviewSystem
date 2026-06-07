from datetime import datetime, timezone


class ScheduledCourse:
    def __init__(
        self,
        userId,
        courseId,
        serialNumber="",
        title="",
        department="",
        credits=0,
        professor="",
        schedule="",
        location="",
        days=None,
        timeSlot="",
        createdAt=None,
    ):
        self.userId = self._required_text(userId, "userId")
        self.courseId = self._required_text(courseId, "courseId")
        self.serialNumber = self._text(serialNumber)
        self.title = self._text(title)
        self.department = self._text(department)
        self.credits = self._non_negative_int(credits)
        self.professor = self._text(professor)
        self.schedule = self._text(schedule)
        self.location = self._text(location)
        self.days = self._string_list(days)
        self.timeSlot = self._text(timeSlot)
        self.createdAt = self._parse_datetime(createdAt) or datetime.now(timezone.utc)

    @staticmethod
    def _text(value):
        return "" if value is None else str(value).strip()

    @classmethod
    def _required_text(cls, value, field_name):
        cleaned = cls._text(value)
        if not cleaned:
            raise ValueError(f"{field_name} is required.")
        return cleaned

    @staticmethod
    def _non_negative_int(value):
        try:
            return max(0, int(value or 0))
        except (TypeError, ValueError):
            return 0

    @staticmethod
    def _string_list(values):
        if not isinstance(values, list):
            return []
        return [str(value).strip() for value in values if str(value).strip()]

    @staticmethod
    def _parse_datetime(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            parsed = value
        elif isinstance(value, str):
            try:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError as error:
                raise ValueError("createdAt must be a valid ISO datetime.") from error
        else:
            raise ValueError("createdAt must be a valid ISO datetime.")
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

    @classmethod
    def from_course_snapshot(cls, user_id, data):
        return cls(
            userId=user_id,
            courseId=data.get("courseID") or data.get("courseId"),
            serialNumber=data.get("serialNumber"),
            title=data.get("title"),
            department=data.get("department"),
            credits=data.get("credits", 0),
            professor=data.get("professor"),
            schedule=data.get("schedule"),
            location=data.get("location"),
            days=data.get("days"),
            timeSlot=data.get("timeSlot"),
            createdAt=data.get("createdAt"),
        )

    def to_dict(self):
        return {
            "courseID": self.courseId,
            "serialNumber": self.serialNumber,
            "title": self.title,
            "department": self.department,
            "credits": self.credits,
            "professor": self.professor,
            "schedule": self.schedule,
            "location": self.location,
            "days": self.days,
            "timeSlot": self.timeSlot,
            "createdAt": self.createdAt.isoformat(),
        }

    def to_persistence_dict(self):
        data = self.to_dict()
        data.update({
            "userId": self.userId,
            "courseId": self.courseId,
            "createdAt": self.createdAt,
        })
        return data
