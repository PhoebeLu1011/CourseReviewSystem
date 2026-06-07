import re
from models.course import Course, CourseSearchCriteria

class CourseRepository:
    def __init__(self, db):
        self.collection = db["courses"]

    def find_by_id(self, course_id):
        data = self.collection.find_one({
            "$or": [
                {"courseID": course_id},
                {"serialNumber": course_id},
                {"開課序號": course_id},
            ]
        })
        if not data:
            return None
        return self._to_course(data)

    def save(self, course):
        self.collection.update_one(
            {"courseID": course.courseID},
            {"$set": course.to_dict()},
            upsert=True
        )

    def _build_query(self, criteria: CourseSearchCriteria):
        conditions = []

        if criteria.query:
            pattern = re.escape(criteria.query)
            conditions.append({
                "$or": [
                    {field: {"$regex": pattern, "$options": "i"}}
                    for field in (
                        "title", "課程名稱", "professors", "老師", "courseCode",
                        "課程資訊", "serialNumber", "開課序號", "department", "開課系所",
                    )
                ]
            })

        if criteria.department:
            pattern = re.escape(criteria.department)
            conditions.append({
                "$or": [
                    {"department": {"$regex": pattern, "$options": "i"}},
                    {"開課系所": {"$regex": pattern, "$options": "i"}}
                ]
            })

        if criteria.semester:
            conditions.append({
                "$or": [{"semester": criteria.semester}, {"學期": criteria.semester}]
            })

        if criteria.academic_year:
            conditions.append({
                "$or": [
                    {"academicYear": criteria.academic_year},
                    {"學年": criteria.academic_year},
                ]
            })

        if criteria.level:
            level_conditions = [
                {"level": criteria.level},
                {"學制": criteria.level},
            ]

            if criteria.level == "博士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]博[）\)]"}})
            elif criteria.level == "碩士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]碩[）\)]"}})
            elif criteria.level == "學士班":
                level_conditions.append({"開課系所": {"$regex": r"[（\(]學[）\)]|學程$"}})
            elif criteria.level == "其他":
                level_conditions.append({"開課系所": {"$not": {"$regex": r"[（\(][博碩學][）\)]|學程$"}}})

            conditions.append({"$or": level_conditions})

        return {"$and": conditions} if conditions else {}

    def search_courses(self, criteria: CourseSearchCriteria):
        query = self._build_query(criteria)
        cursor = (
            self.collection.find(query)
            .sort([("academicYear", -1), ("semester", -1), ("courseID", 1)])
            .skip(criteria.skip)
            .limit(criteria.limit)
        )
        return [self._to_course(data) for data in cursor]

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
        
    def count_courses(self, criteria: CourseSearchCriteria):
        return self.collection.count_documents(self._build_query(criteria))

    @staticmethod
    def _to_course(data):
        data = dict(data)
        data.pop("_id", None)
        return Course(**data)
