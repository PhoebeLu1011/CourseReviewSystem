from repository.course_repository import CourseRepository


class CourseService:
    def __init__(self, course_repo: CourseRepository):
        self.course_repo = course_repo

    def get_course(self, course_id: str):
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")
        return course.to_dict()

    def search_courses(self, query: str, limit=20, skip=0,
                       department=None, level=None, semester=None, academicYear=None):
        courses = self.course_repo.search_courses(
            query, limit, skip,
            department=department, level=level,
            semester=semester, academicYear=academicYear,
        )
        return [c.to_dict() for c in courses]

    def get_departments(self):
        return self.course_repo.get_departments()

    def get_academic_years(self):
        return self.course_repo.get_academic_years()

    def count_courses(self, query: str, department=None, level=None,
                      semester=None, academicYear=None):
        return self.course_repo.count_courses(
            query, department=department, level=level,
            semester=semester, academicYear=academicYear,
        )

    def update_course_ratings(self, course_id: str, new_sweetness: float, new_workload: float):
        """
        Triggered whenever a student leaves a brand new review.
        Updates the averages running incrementally.
        """
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found to update scores.")
        # Increment total count of reviews
        course.reviewCount += 1

        # Incremental moving average formula
        course.averageSweetness += (new_sweetness - course.averageSweetness) / course.reviewCount
        course.averageWorkload  += (new_workload  - course.averageWorkload)  / course.reviewCount
        
        self.course_repo.save(course)
        return course.to_dict()

def recalculate_course_ratings(self, course_id: str, reviews_list: list):
        """
        Wipes out old averages and recalculates the total review count 
        and scores from scratch using a list of real active reviews.
        """
        course = self.course_repo.find_by_id(course_id)
        if not course:
            raise ValueError("Course not found to recalculate scores.")
        
        count = len(reviews_list)
        course.reviewCount = count
        
        if count == 0:
            course.averageSweetness = 0.0
            course.averageWorkload = 0.0
        else:
            total_sweetness = sum(r.get("sweetnessScore", 0) for r in reviews_list)
            total_workload = sum(r.get("workloadScore", 0) for r in reviews_list)
            course.averageSweetness = total_sweetness / count
            course.averageWorkload = total_workload / count
            
        self.course_repo.save(course)
        return course.to_dict()