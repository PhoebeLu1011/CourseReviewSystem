import re
from models.course import Course

class CourseRepository:
    def __init__(self, db):
        self.collection = db["courses"]

    def find_by_id(self, course_id):
        data = self.collection.find_one({"courseID": course_id})
        if not data:
            return None
        data.pop("_id", None)
        return Course(**data)

    def save(self, course):
        self.collection.update_one(
            {"courseID": course.courseID},
            {"$set": course.to_dict()},
            upsert=True
        )

    def _build_query(self, search_query="", department=None, level=None,
                     semester=None, academicYear=None):
        conditions = []

        if search_query:
            conditions.append({
                "$or": [
                    {"title":        {"$regex": search_query, "$options": "i"}},
                    {"professors":   {"$regex": search_query, "$options": "i"}},
                    {"courseCode":   {"$regex": search_query, "$options": "i"}},
                    {"serialNumber": {"$regex": search_query, "$options": "i"}},
                    {"department":   {"$regex": search_query, "$options": "i"}},
                ]
            })

        if department:
            conditions.append({"department": {"$regex": f"^{re.escape(department)}", "$options": "i"}})

        if semester:
            conditions.append({"semester": semester})

        if academicYear:
            conditions.append({"academicYear": academicYear})

        if level:
            conditions.append({"level": level})

        return {"$and": conditions} if conditions else {}

    def search_courses(self, search_query, limit=20, skip=0,
                       department=None, level=None, semester=None, academicYear=None):
        query = self._build_query(search_query, department, level, semester, academicYear)
        cursor = self.collection.find(query).skip(skip).limit(limit)
        courses = []
        for data in cursor:
            data.pop("_id", None)
            courses.append(Course(**data))
        return courses

    def get_departments(self):
        raw_depts = self.collection.distinct("department")
        clean_depts = set()
        for dept in raw_depts:
            if dept:
                clean = re.sub(r'[（\(][碩博學][）\)]', '', dept).strip()
                clean_depts.add(clean)
        return sorted(list(clean_depts))

    def get_academic_years(self):
        return sorted(self.collection.distinct("academicYear"), reverse=True)
        
    def count_courses(self, search_query="", department=None, level=None,
                      semester=None, academicYear=None):
        query = self._build_query(search_query, department, level, semester, academicYear)
        return self.collection.count_documents(query)