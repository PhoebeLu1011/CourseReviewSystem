from datetime import datetime
from models.user import Student
from models.group import Group
from utils.student_id_parser import StudentIdParser

class GroupRecommendationService:
    def __init__(self, group_repo):
        self.group_repo = group_repo

    def recommend_groups(self, student: Student, course_id: str) -> list[Group]:
        groups = self.group_repo.find_joinable_by_course(course_id)
        return self.sort_groups_by_score(groups, student)

    def calculate_match_score(self, student: Student, group: Group) -> float:
        leader_similarity_score = self.calculate_student_similarity(
            student.studentID,
            group.leader_id
        )

        average_member_similarity_score = self.calculate_average_member_similarity(
            student.studentID,
            group
        )

        available_slots = group.max_members - len(group.members)
        deadline_bonus = self.calculate_deadline_bonus(group)

        final_score = (
            (1.2 * leader_similarity_score + average_member_similarity_score) / 2.2
            + 2 * available_slots
            + deadline_bonus
        )

        return final_score

    def calculate_student_similarity(self, student_id_a: str, student_id_b: str) -> int:
        info_a = StudentIdParser.parse(student_id_a)
        info_b = StudentIdParser.parse(student_id_b)

        score = 0

        if info_a["department"] == info_b["department"]:
            score += 20

        year_diff = abs(info_a["admission_year"] - info_b["admission_year"])
        if year_diff == 0:
            score += 10
        elif year_diff == 1:
            score += 5

        if info_a["program_level"] == info_b["program_level"]:
            score += 5

        if info_a["class_code"] == info_b["class_code"]:
            score += 5

        if info_a["college"] == info_b["college"]:
            score += 3

        return score

    def calculate_average_member_similarity(self, student_id: str, group: Group) -> float:
        non_leader_members = [
            member_id for member_id in group.members
            if member_id != group.leader_id
        ]

        if not non_leader_members:
            return self.calculate_student_similarity(student_id, group.leader_id)

        total_score = 0

        for member_id in non_leader_members:
            total_score += self.calculate_student_similarity(student_id, member_id)

        return total_score / len(non_leader_members)

    def calculate_deadline_bonus(self, group: Group) -> int:
        if group.recruitment_deadline is None:
            return 0

        days_left = (group.recruitment_deadline - datetime.now()).days

        if days_left <= 1:
            return 5
        elif days_left <= 3:
            return 3
        else:
            return 0

    def sort_groups_by_score(self, groups: list[Group], student: Student) -> list[Group]:
        return sorted(
            groups,
            key=lambda group: self.calculate_match_score(student, group),
            reverse=True
        )