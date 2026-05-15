from repository.badge_repository import BadgeRepository


class AchievementService:
    def __init__(self, badge_repo: BadgeRepository):
        self.badge_repo = badge_repo

    def calculate_achievement_score(self, student) -> int:
        return (
            student.reviewCount * 2
            + student.replyCount * 1
            + student.applyCount * 1
        )

    def check_badge_eligibility(self, student, badge) -> bool:
        achievement_score = self.calculate_achievement_score(student)

        return (
            student.reviewCount >= badge.minReviewCount
            and student.replyCount >= badge.minReplyCount
            and student.applyCount >= badge.minApplyCount
            and achievement_score >= badge.minAchievementScore
        )

    def update_student_badges(self, student) -> list:
        newly_awarded_badges = []
        all_badges = self.badge_repo.find_all()

        if not hasattr(student, "badges") or student.badges is None:
            student.badges = {}

        for badge in all_badges:
            if not self.check_badge_eligibility(student, badge):
                continue

            current_badge_id = student.badges.get(badge.category)

            if current_badge_id is None:
                student.badges[badge.category] = badge.badgeID
                newly_awarded_badges.append(badge)
                continue

            current_badge = self.badge_repo.find_by_id(current_badge_id)

            if current_badge is None or badge.level > current_badge.level:
                student.badges[badge.category] = badge.badgeID
                newly_awarded_badges.append(badge)

        return newly_awarded_badges