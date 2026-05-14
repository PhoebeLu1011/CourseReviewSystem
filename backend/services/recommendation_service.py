from models.user import Student
from models.group import Group

class RecommendationService:
    def __init__(self, group_repo):
        self.group_repo = group_repo

    def recommend_groups(self, student: Student, course_id: str) -> list[Group]:
        # fetch all joinable groups for the given course
        groups = self.group_repo.find_joinable_by_course(course_id)

        # calculate match score for each group and sort by score descending
        return self.sort_groups_by_score(groups, student)

    def calculate_match_score(self, student: Student, group: Group) -> int:
        # [Discussion] define scoring criteria 
        # suggested criteria:
        # - same department as leader or majority of members → +points
        # - same grade → +points
        # - matching tags → +points per match
        score = 0
        return score

    def sort_groups_by_score(self, groups: list[Group], student: Student) -> list[Group]:
        # sort groups by match score in descending order
        return sorted(groups, key=lambda g: self.calculate_match_score(student, g), reverse=True)