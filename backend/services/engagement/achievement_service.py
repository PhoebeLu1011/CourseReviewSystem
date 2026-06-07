from repository.badge_repository import BadgeRepository


class WeightedAchievementScoreStrategy:
    """Strategy for converting student activity into an achievement score."""

    def __init__(self, review_weight=2, reply_weight=1, apply_weight=1):
        self.review_weight = review_weight
        self.reply_weight = reply_weight
        self.apply_weight = apply_weight

    def calculate(self, student):
        return (
            student.reviewCount * self.review_weight
            + student.replyCount * self.reply_weight
            + student.applyCount * self.apply_weight
        )


class BadgeEligibilitySpecification:
    """Specification that answers whether one student qualifies for one badge."""

    def __init__(self, score_strategy):
        self.score_strategy = score_strategy

    def is_satisfied_by(self, student, badge):
        return (
            student.reviewCount >= badge.minReviewCount
            and student.replyCount >= badge.minReplyCount
            and student.applyCount >= badge.minApplyCount
            and self.score_strategy.calculate(student) >= badge.minAchievementScore
        )


class AchievementService:
    def __init__(
        self,
        badge_repo: BadgeRepository,
        student_repo=None,
        score_strategy=None,
        eligibility_specification=None,
    ):
        self.badge_repo = badge_repo
        self.student_repo = student_repo
        self.score_strategy = score_strategy or WeightedAchievementScoreStrategy()
        self.eligibility_specification = (
            eligibility_specification
            or BadgeEligibilitySpecification(self.score_strategy)
        )

    def calculate_achievement_score(self, student):
        return self.score_strategy.calculate(student)

    def check_badge_eligibility(self, student, badge):
        return self.eligibility_specification.is_satisfied_by(student, badge)

    def update_student_badges(self, student):
        all_badges = self.badge_repo.find_all()
        badge_by_id = {badge.badgeID: badge for badge in all_badges}
        best_eligible = {}

        for badge in all_badges:
            if not self.check_badge_eligibility(student, badge):
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
