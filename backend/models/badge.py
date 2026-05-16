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
        self.badgeID = badgeID
        self.badgeName = badgeName
        self.category = category
        self.description = description
        self.level = level
        self.minReviewCount = minReviewCount
        self.minReplyCount = minReplyCount
        self.minApplyCount = minApplyCount
        self.minAchievementScore = minAchievementScore

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