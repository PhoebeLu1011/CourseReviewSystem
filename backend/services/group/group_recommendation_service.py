from dataclasses import dataclass

from models.group import Group
from services.group.group_recommendation_strategies import (
    CapacityScoringStrategy,
    DeadlineUrgencyScoringStrategy,
    StudentSimilarityScoringStrategy,
)


@dataclass(frozen=True)
class GroupRecommendation:
    group: Group
    score: float

    def to_dict(self) -> dict:
        data = self.group.to_dict()
        data["recommendation_score"] = self.score
        return data


class GroupRecommendationService:
    def __init__(self, group_repo, application_repo=None, scoring_strategies=None):
        self.group_repo = group_repo
        self.application_repo = application_repo
        self.scoring_strategies = scoring_strategies or [
            StudentSimilarityScoringStrategy(),
            CapacityScoringStrategy(),
            DeadlineUrgencyScoringStrategy(),
        ]

    def list_joinable_groups(self, course_id: str | None = None) -> list[Group]:
        return self.group_repo.find_joinable_by_course(course_id)

    def recommend_groups(
        self,
        student_id: str,
        course_id: str | None = None
    ) -> list[Group]:
        return [
            recommendation.group
            for recommendation in self.recommend_group_results(student_id, course_id)
        ]

    def recommend_group_results(
        self,
        student_id: str,
        course_id: str | None = None,
    ) -> list[GroupRecommendation]:
        groups = self.list_joinable_groups(course_id)
        unavailable_course_ids = {
            group.course_id
            for group in self.group_repo.find_by_member(student_id)
        }
        if self.application_repo:
            unavailable_course_ids.update(
                application.course_id
                for application in self.application_repo.find_pending_by_student(
                    student_id
                )
                if application.course_id
            )
        groups = [
            group
            for group in groups
            if group.course_id not in unavailable_course_ids
        ]
        # Score once and carry the result to the route instead of calculating it again.
        recommendations = [
            GroupRecommendation(group, self.calculate_match_score(student_id, group))
            for group in groups
        ]
        return sorted(
            recommendations,
            key=lambda recommendation: (
                recommendation.score,
                -len(recommendation.group.members) / recommendation.group.max_members,
                recommendation.group.group_id,
            ),
            reverse=True,
        )

    def calculate_match_score(self, student_id: str, group: Group) -> float:
        return sum(
            strategy.score(student_id, group)
            for strategy in self.scoring_strategies
        )
