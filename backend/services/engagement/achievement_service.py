from repository.badge_repository import BadgeRepository


REVIEW_SCORE_WEIGHT = 2
REPLY_SCORE_WEIGHT = 1
APPLICATION_SCORE_WEIGHT = 1


class AchievementService:
    def __init__(
        self,
        badge_repo: BadgeRepository,
        student_repo=None,
    ):
        self.badge_repo = badge_repo
        self.student_repo = student_repo

    def calculate_achievement_score(self, student):
        return (
            student.reviewCount * REVIEW_SCORE_WEIGHT
            + student.replyCount * REPLY_SCORE_WEIGHT
            + student.applyCount * APPLICATION_SCORE_WEIGHT
        )

    def check_badge_eligibility(self, student, badge):
        return badge.is_earned_by(student, self.calculate_achievement_score(student))

    def update_student_badges(self, student):
        all_badges = self.badge_repo.find_all()
        badge_by_id = {badge.badgeID: badge for badge in all_badges}
        best_eligible = {}
        achievement_score = self.calculate_achievement_score(student)

        for badge in all_badges:
            if not badge.is_earned_by(student, achievement_score):
                continue
            current = best_eligible.get(badge.category)
            if current is None or badge.level > current.level:
                best_eligible[badge.category] = badge

        student.badges = student.badges or {}
        newly_awarded = []
        for category, badge in best_eligible.items():
            current = badge_by_id.get(student.badges.get(category))
            if current is None or badge.level > current.level:
                student.badges[category] = badge.badgeID
                newly_awarded.append(badge)
        return newly_awarded

    def get_current_badges(self, student):
        badge_ids = set((student.badges or {}).values())
        badges = self.badge_repo.find_by_ids(badge_ids)
        return sorted(badges, key=lambda badge: (badge.category, -badge.level))

    def get_student_badges(self, student_id):
        student = self._get_student_or_raise(student_id)
        return student, self.get_current_badges(student)

    def get_student_score(self, student_id):
        student = self._get_student_or_raise(student_id)
        return student, self.calculate_achievement_score(student)

    def award_eligible_badges(self, student_id):
        student = self._get_student_or_raise(student_id)
        new_badges = self.update_student_badges(student)
        self.student_repo.save(student)
        return student, new_badges

    def _get_student_or_raise(self, student_id):
        if not self.student_repo:
            raise ValueError("Student repository is not configured.")
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found.")
        return student
