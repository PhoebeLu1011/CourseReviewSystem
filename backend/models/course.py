import re
from dataclasses import dataclass

COURSE_LEVELS = {"學士班", "碩士班", "博士班", "其他"}
COURSE_SEMESTERS = {"1", "2"}

def derive_level(department: str) -> str:
    """Derive course level from NTNU department name."""
    if re.search(r"[（(]博[）)]", department):
        return "博士班"
    if re.search(r"[（(]碩[）)]", department):
        return "碩士班"
    if re.search(r"[（(]學[）)]", department) or department.endswith("學程"):
        return "學士班"
    return "其他"

@dataclass(frozen=True)
class CourseSearchCriteria:
    query: str = ""
    department: str | None = None
    level: str | None = None
    semester: str | None = None
    academic_year: str | None = None
    limit: int = 20
    skip: int = 0

    def __post_init__(self):
        object.__setattr__(self, "query", self._clean(self.query) or "")
        object.__setattr__(self, "department", self._clean(self.department))
        object.__setattr__(self, "level", self._clean(self.level))
        object.__setattr__(self, "semester", self._clean(self.semester))
        object.__setattr__(self, "academic_year", self._clean(self.academic_year))
        object.__setattr__(self, "limit", self._to_int(self.limit, "limit"))
        object.__setattr__(self, "skip", self._to_int(self.skip, "skip"))

        if self.level and self.level not in COURSE_LEVELS:
            raise ValueError("Invalid course level.")
        if self.semester and self.semester not in COURSE_SEMESTERS:
            raise ValueError("Invalid semester.")
        if not 1 <= self.limit <= 100:
            raise ValueError("limit must be between 1 and 100.")
        if self.skip < 0:
            raise ValueError("skip cannot be negative.")

    @staticmethod
    def _clean(value):
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None

    @staticmethod
    def _to_int(value, field_name):
        try:
            return int(value)
        except (TypeError, ValueError) as error:
            raise ValueError(f"{field_name} must be an integer.") from error

class Course:
    def __init__(self, **kwargs):
        # 1. Extract components for composite ID first
        self.serialNumber = self._text(kwargs.get("serialNumber") or kwargs.get("開課序號"))
        self.academicYear = self._text(kwargs.get("academicYear") or kwargs.get("學年"))
        self.semester = self._text(kwargs.get("semester") or kwargs.get("學期"))

        # 2. Generate composite courseID
        provided_id = kwargs.get("courseID")
        if provided_id:
            self.courseID = self._required_text(provided_id, "courseID")
        elif self.serialNumber and self.academicYear and self.semester:
            self.courseID = f"{self.serialNumber}_{self.academicYear}_{self.semester}"
        else:
            self.courseID = self._required_text(self.serialNumber, "courseID")

        # 3. Extract the rest
        self.courseCode = self._text(kwargs.get("courseCode") or kwargs.get("課程資訊"))
        self.title = self._required_text(
            kwargs.get("title") or kwargs.get("課程名稱"),
            "title",
        )

        raw_dept = self._text(kwargs.get("department") or kwargs.get("開課系所"))
        self.department = re.sub(r'[（\(][碩博學][）\)]', '', raw_dept).strip()

        self.timeAndLocation = self._text(
            kwargs.get("timeAndLocation") or kwargs.get("上課時間與地點")
        )
        self.syllabusURL = self._text(
            kwargs.get("syllabusURL") or kwargs.get("課程大綱連結")
        )

        profs_raw = kwargs.get("professors") or kwargs.get("老師", "")
        if isinstance(profs_raw, list):
            professors = [self._text(professor) for professor in profs_raw]
        else:
            professors = self._text(profs_raw).replace(",", " ").split()
        self.professors = list(dict.fromkeys(professor for professor in professors if professor))

        self.credits = self._non_negative_int(
            kwargs.get("credits", kwargs.get("學分", 0))
        )
        self.capacity = self._non_negative_int(
            kwargs.get("capacity", kwargs.get("課程名額", 0))
        )
        self.level = self._text(
            kwargs.get("level") or kwargs.get("學制") or derive_level(raw_dept)
        )
        if self.level not in COURSE_LEVELS:
            raise ValueError("Invalid course level.")

        self.averageSweetness = self._non_negative_float(kwargs.get("averageSweetness", 0))
        self.averageWorkload = self._non_negative_float(kwargs.get("averageWorkload", 0))
        self.reviewCount = self._non_negative_int(kwargs.get("reviewCount", 0))

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
    def _non_negative_float(value):
        try:
            return max(0.0, float(value or 0))
        except (TypeError, ValueError):
            return 0.0

    def to_dict(self):
        return {
            "courseID": self.courseID,
            "courseCode": self.courseCode,
            "title": self.title,
            "serialNumber": self.serialNumber,
            "department": self.department,
            "professors": self.professors,
            "timeAndLocation": self.timeAndLocation,
            "syllabusURL": self.syllabusURL,
            "academicYear": self.academicYear,
            "semester": self.semester,
            "credits": self.credits,
            "capacity": self.capacity,
            "level": self.level,
            "averageSweetness": self.averageSweetness,
            "averageWorkload": self.averageWorkload,
            "reviewCount": self.reviewCount,
        }