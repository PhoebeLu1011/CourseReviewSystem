import re

class StudentIdParser:
    PROGRAM_LEVEL_MAP = {
        "4": "bachelor",
        "6": "master",
        "8": "phd",
    }

    @staticmethod
    def parse(student_id: str) -> dict:
        if not student_id:
            raise ValueError("Student ID is required.")

        student_id = student_id.strip().upper()

        if not re.match(r"^\d{8}[A-Z]$", student_id):
            raise ValueError("Student ID format is invalid.")

        program_level_code = student_id[0]

        if program_level_code not in StudentIdParser.PROGRAM_LEVEL_MAP:
            raise ValueError(f"Invalid program level code: {program_level_code}")

        return {
            "student_id": student_id,
            "program_level": StudentIdParser.PROGRAM_LEVEL_MAP[program_level_code],
            "program_level_code": program_level_code,
            "admission_year": int(student_id[1:3]),
            "department": student_id[3:5],
            "class_code": student_id[5],
            "seat_number": student_id[6:8],
            "college": student_id[8],
        }