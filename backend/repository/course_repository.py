from models.course import Course

class CourseRepository:
    def __init__(self, db):
        self.collection = db["courses"]

    def find_by_id(self, course_id):
        data = self.collection.find_one({"courseID": course_id})
        if not data: 
            return None
        data.pop("_id", None)  # Remove MongoDB's internal ID before returning
        return Course(**data)

    def save(self, course):
        self.collection.update_one(
            {"courseID": course.courseID},
            {"$set": course.to_dict()},
            upsert=True
        )
        
    def search_courses(self, search_query, limit=20, skip=0):
        """
        Search for courses by title, professor, ID, or department 
        using case-insensitive regex matching.
        """
        query = {
            "$or": [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"professors": {"$regex": search_query, "$options": "i"}},
                {"courseID": {"$regex": search_query, "$options": "i"}},    
                {"department": {"$regex": search_query, "$options": "i"}}   
            ]
        }
        cursor = self.collection.find(query).skip(skip).limit(limit)
        
        courses = []
        for data in cursor:
            data.pop("_id", None)
            courses.append(Course(**data))
        return courses