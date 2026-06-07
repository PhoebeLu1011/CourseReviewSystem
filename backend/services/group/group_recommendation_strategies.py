from datetime import datetime, timezone
from functools import lru_cache
from typing import Protocol

from models.group import Group
from utils.student_id_parser import StudentIdParser


class GroupScoringStrategy(Protocol):
    def score(self, student_id: str, group: Group) -> float:
        ...


class StudentSimilarityScoringStrategy:
    def score(self, student_id: str, group: Group) -> float:
        leader_score = self.calculate_student_similarity(student_id, group.leader_id)
        member_score_total = 0
        member_count = 0
        for member_id in group.members:
            if member_id == group.leader_id:
                continue
            member_score_total += self.calculate_student_similarity(
                student_id,
                member_id,
            )
            member_count += 1

        average_member_score = (
            member_score_total / member_count
            if member_count
            else leader_score
        )
        return (1.2 * leader_score + average_member_score) / 2.2

    @staticmethod
    def calculate_student_similarity(student_id_a: str, student_id_b: str) -> int:
        info_a = StudentSimilarityScoringStrategy._try_parse_student_id(student_id_a)
        info_b = StudentSimilarityScoringStrategy._try_parse_student_id(student_id_b)
        if not info_a or not info_b:
            return 0

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

    @staticmethod
    @lru_cache(maxsize=4096)
    def _try_parse_student_id(student_id: str) -> dict | None:
        # Student IDs do not change, so a small bounded cache avoids parsing them for every group.
        try:
            return StudentIdParser.parse(student_id)
        except (TypeError, ValueError, KeyError):
            return None


class CapacityScoringStrategy:
    """Slightly favors groups with room without letting large groups dominate."""

    def score(self, student_id: str, group: Group) -> float:
        del student_id
        available_slots = max(group.max_members - len(group.members), 0)
        return 10 * available_slots / group.max_members


class DeadlineUrgencyScoringStrategy:
    def score(self, student_id: str, group: Group) -> float:
        del student_id
        if group.recruitment_deadline is None:
            return 0

        deadline = group.recruitment_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        hours_left = (deadline - datetime.now(timezone.utc)).total_seconds() / 3600
        if hours_left < 0:
            return 0
        if hours_left <= 24:
            return 5
        if hours_left <= 72:
            return 3
        return 0
