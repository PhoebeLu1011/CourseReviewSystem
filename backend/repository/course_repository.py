import re
from models.course import Course

class CourseRepository:
    def __init__(self, db):
        self.collection = db["courses"]

    def find_by_id(self, course_id):
        # Check both English ID and Chinese Serial Number
        data = self.collection.find_one({
            "$or": [{"courseID": course_id}, {"開課序號": course_id}]
        })
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
                    {"課程名稱":     {"$regex": search_query, "$options": "i"}},
                    {"professors":   {"$regex": search_query, "$options": "i"}},
                    {"老師":         {"$regex": search_query, "$options": "i"}},
                    {"courseCode":   {"$regex": search_query, "$options": "i"}},
                    {"課程資訊":     {"$regex": search_query, "$options": "i"}},
                    {"serialNumber": {"$regex": search_query, "$options": "i"}},
                    {"開課序號":     {"$regex": search_query, "$options": "i"}},
                    {"department":   {"$regex": search_query, "$options": "i"}},
                    {"開課系所":     {"$regex": search_query, "$options": "i"}},
                ]
            })

        if department:
            conditions.append({
                "$or": [
                    {"department": {"$regex": re.escape(department), "$options": "i"}},
                    {"開課系所": {"$regex": re.escape(department), "$options": "i"}}
                ]
            })

        if semester:
            conditions.append({
                "$or": [{"semester": semester}, {"學期": semester}]
            })

        if academicYear:
            conditions.append({
                "$or": [{"academicYear": academicYear}, {"學年": academicYear}]
            })

        if level:
            # Tell MongoDB how to translate the English level into the raw Chinese tags
            level_conditions = [
                {"level": level}, 
                {"學制": level}
            ]
            
            if level == "博士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]博[）\)]"}})
            elif level == "碩士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]碩[）\)]"}})
            elif level == "學士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]學[）\)]|學程$"}})
            elif level == "其他":
                # For 'other', find courses that don't match any of the above tags
                level_conditions.append({"開課系所": {"$not": {"$regex": r"[（\(][博碩學][）\)]|學程$"}}})
                
            conditions.append({"$or": level_conditions})

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
        # Scan both fields in the database
        raw_depts = self.collection.distinct("department")
        zh_depts = self.collection.distinct("開課系所")
        
        clean_depts = set()
        for dept in (raw_depts + zh_depts):
            if dept:
                # Strip out the (學)/(碩)/(博) tags
                clean = re.sub(r'[（\(][碩博學][）\)]', '', str(dept)).strip()
                clean_depts.add(clean)
                
        return sorted(list(clean_depts))

    def get_academic_years(self):
        # Scan both fields in the database
        raw_years = self.collection.distinct("academicYear")
        zh_years = self.collection.distinct("學年")
        
        years = set(str(y).strip() for y in (raw_years + zh_years) if y)
        return sorted(list(years), reverse=True)
        
    def count_courses(self, search_query="", department=None, level=None,
                      semester=None, academicYear=None):
        query = self._build_query(search_query, department, level, semester, academicYear)
        return self.collection.count_documents(query)