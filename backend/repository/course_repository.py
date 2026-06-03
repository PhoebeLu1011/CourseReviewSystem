import re
from models.course import Course

class CourseRepository:
    def __init__(self, db):
        self.collection = db["courses"]

    def find_by_id(self, course_id):
        # Changed to search using the actual DB key
        data = self.collection.find_one({"開課序號": course_id})
        if not data:
            return None
        data.pop("_id", None)
        return Course(**data)

    def save(self, course):
        self.collection.update_one(
            {"開課序號": course.courseID}, # Changed to actual DB key
            {"$set": course.to_dict()},
            upsert=True
        )

    def _build_query(self, search_query="", department=None, level=None,
                     semester=None, academicYear=None):
        conditions = []

        if search_query:
            conditions.append({
                "$or": [
                    {"課程名稱": {"$regex": search_query, "$options": "i"}},
                    {"老師": {"$regex": search_query, "$options": "i"}},
                    {"課程資訊": {"$regex": search_query, "$options": "i"}},
                    {"開課序號": {"$regex": search_query, "$options": "i"}},
                    {"開課系所": {"$regex": search_query, "$options": "i"}},
                ]
            })

        if department:
            # Match anything that starts with the clean department name
            # so searching "資工系" will successfully match "資工系（碩）" in the DB!
            conditions.append({"開課系所": {"$regex": f"^{department}"}})
            
        if semester:
            conditions.append({"學期": semester})
        if academicYear:
            conditions.append({"學年": academicYear})
            
        if level:
            if level == "博士班":
                conditions.append({"開課系所": {"$regex": "（博）"}})
            elif level == "碩士班":
                conditions.append({"開課系所": {"$regex": "（碩）"}})
            elif level == "學士班":
                conditions.append({
                    "$or": [
                        {"開課系所": {"$regex": "（學）"}},
                        {"開課系所": {"$regex": "學程$"}}
                    ]
                })
            elif level == "其他":
                conditions.append({"開課系所": {"$not": {"$regex": "（博）|（碩）|（學）|學程$"}}})

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
        raw_depts = self.collection.distinct("開課系所")
        clean_depts = set() # Use a set to automatically remove duplicates
        for dept in raw_depts:
            if dept:
                # Strip out both full-width （） and half-width () parentheses
                clean = re.sub(r'[（\(][碩博學][）\)]', '', dept).strip()
                clean_depts.add(clean)
        return sorted(list(clean_depts))

    def get_academic_years(self):
        # Querying the actual Chinese key to populate the frontend dropdown
        return sorted(self.collection.distinct("學年"), reverse=True)
        
    def count_courses(self, search_query="", department=None, level=None,
                      semester=None, academicYear=None):
        query = self._build_query(search_query, department, level, semester, academicYear)
        return self.collection.count_documents(query)