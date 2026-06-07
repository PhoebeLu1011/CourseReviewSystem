class Badge:
    def __init__(
        self,
        badgeID: str,
        badgeName: str,
        category: str,
        description: str,
        level: int,
        minReviewCount: int = 0,
        minReplyCount: int = 0,
        minApplyCount: int = 0,
        minAchievementScore: int = 0,
    ):
        self.badgeID = self._required_text(badgeID, "badgeID")
        self.badgeName = self._required_text(badgeName, "badgeName")
        self.category = self._required_text(category, "category")
        self.description = self._required_text(description, "description")
        self.level = self._positive_int(level, "level")
        self.minReviewCount = self._non_negative_int(minReviewCount, "minReviewCount")
        self.minReplyCount = self._non_negative_int(minReplyCount, "minReplyCount")
        self.minApplyCount = self._non_negative_int(minApplyCount, "minApplyCount")
        self.minAchievementScore = self._non_negative_int(
            minAchievementScore,
            "minAchievementScore",
        )

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    @staticmethod
    def _non_negative_int(value, field_name):
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise ValueError(f"{field_name} must be a non-negative integer.")
        return value

    @classmethod
    def _positive_int(cls, value, field_name):
        value = cls._non_negative_int(value, field_name)
        if value == 0:
            raise ValueError(f"{field_name} must be greater than 0.")
        return value

    def to_dict(self):
        return {
            "badgeID": self.badgeID,
            "badgeName": self.badgeName,
            "category": self.category,
            "description": self.description,
            "level": self.level,
            "minReviewCount": self.minReviewCount,
            "minReplyCount": self.minReplyCount,
            "minApplyCount": self.minApplyCount,
            "minAchievementScore": self.minAchievementScore,
        }
