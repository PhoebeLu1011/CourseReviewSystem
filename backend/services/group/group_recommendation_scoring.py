from datetime import datetime, timezone
from functools import lru_cache

from models.group import Group
from utils.student_id_parser import StudentIdParser


def calculate_group_match_score(student_id: str, group: Group) -> float:
    """Score one group with the few signals we actually use today."""
    return (
        _student_similarity_score(student_id, group)
        + calculate_capacity_score(group)
        + _deadline_urgency_score(group)
    )


def calculate_student_similarity(student_id_a: str, student_id_b: str) -> int:
    info_a = _try_parse_student_id(student_id_a)
    info_b = _try_parse_student_id(student_id_b)
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


def _student_similarity_score(student_id: str, group: Group) -> float:
    leader_score = calculate_student_similarity(student_id, group.leader_id)
    member_scores = [
        calculate_student_similarity(student_id, member_id)
        for member_id in group.members
        if member_id != group.leader_id
    ]
    average_member_score = (
        sum(member_scores) / len(member_scores)
        if member_scores
        else leader_score
    )
    return (1.2 * leader_score + average_member_score) / 2.2


def calculate_capacity_score(group: Group) -> float:
    if group.max_members <= 0:
        return 0
    available_slots = max(group.max_members - len(group.members), 0)
    return 10 * available_slots / group.max_members


def _deadline_urgency_score(group: Group) -> float:
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


@lru_cache(maxsize=4096)
def _try_parse_student_id(student_id: str) -> dict | None:
    # Student IDs do not change, so caching saves repeated parsing across group cards.
    try:
        return StudentIdParser.parse(student_id)
    except (TypeError, ValueError, KeyError):
        return None
