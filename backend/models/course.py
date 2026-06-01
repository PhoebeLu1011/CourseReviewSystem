def derive_level(department: str) -> str:
    """Derive course level from NTNU department name."""
    if "（博）" in department:
        return "博士班"
    if "（碩）" in department:
        return "碩士班"
    if "（學）" in department or department.endswith("學程"):
        return "學士班"
    return "其他"


class Course:
    def __init__(
        self,
        courseID,       # composite key: {serialNumber}_{academicYear}_{semester}
        courseCode,     # original code from CSV (e.g. TAC8001)
        title,
        serialNumber,
        department,
        professors,
        timeAndLocation,
        academicYear,
        semester,
        syllabusURL="",
        averageSweetness=0.0,
        averageWorkload=0.0,
        reviewCount=0,
        credits=0,
        capacity=0,
        level="",
    ):
        self.courseID = courseID
        self.courseCode = courseCode
        self.title = title
        self.serialNumber = serialNumber
        self.department = department
        self.professors = professors
        self.timeAndLocation = timeAndLocation
        self.academicYear = academicYear
        self.semester = semester
        self.syllabusURL = syllabusURL
        self.credits = int(credits) if credits else 0
        self.capacity = int(capacity) if capacity else 0
        self.level = level or derive_level(department)

        # Aggregated stats
        self.averageSweetness = float(averageSweetness)
        self.averageWorkload = float(averageWorkload)
        self.reviewCount = int(reviewCount)

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
