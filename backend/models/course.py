import re
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
    def __init__(self, **kwargs):
        # 1. Base ID fields
        self.courseID = str(kwargs.get("courseID") or kwargs.get("開課序號", ""))
        self.courseCode = str(kwargs.get("courseCode") or kwargs.get("課程資訊", ""))
        self.serialNumber = str(kwargs.get("serialNumber") or kwargs.get("開課序號", ""))
        
        # 2. Text fields
        self.title = str(kwargs.get("title") or kwargs.get("課程名稱", ""))
        
        # ---- THE FIX IS HERE ----
        raw_dept = str(kwargs.get("department") or kwargs.get("開課系所", ""))
        # Strip out the tags for the UI
        self.department = re.sub(r'[（\(][碩博學][）\)]', '', raw_dept).strip()
        # -------------------------

        self.timeAndLocation = str(kwargs.get("timeAndLocation") or kwargs.get("上課時間與地點", ""))
        self.academicYear = str(kwargs.get("academicYear") or kwargs.get("學年", ""))
        self.semester = str(kwargs.get("semester") or kwargs.get("學期", ""))
        self.syllabusURL = str(kwargs.get("syllabusURL") or kwargs.get("課程大綱連結", ""))
        
        # 3. Handle Professors
        profs_raw = kwargs.get("professors") or kwargs.get("老師", "")
        if isinstance(profs_raw, list):
            self.professors = profs_raw
        else:
            self.professors = [p.strip() for p in str(profs_raw).replace(',', ' ').split() if p.strip()]
            
        # 4. Numeric fields
        try:
            self.credits = int(kwargs.get("credits") or kwargs.get("學分", 0))
        except (ValueError, TypeError):
            self.credits = 0
            
        try:
            self.capacity = int(kwargs.get("capacity") or kwargs.get("課程名額", 0))
        except (ValueError, TypeError):
            self.capacity = 0
            
        # 5. Level and Stats (Notice we pass raw_dept here so the backend still knows the truth!)
        self.level = str(kwargs.get("level") or kwargs.get("學制") or derive_level(raw_dept))
        self.averageSweetness = float(kwargs.get("averageSweetness", 0.0))
        self.averageWorkload = float(kwargs.get("averageWorkload", 0.0))
        self.reviewCount = int(kwargs.get("reviewCount", 0))
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