import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongo import db
from models.badge import Badge
from repository.badge_repository import BadgeRepository


badge_repo = BadgeRepository(db)

badges = [
    Badge(
        badgeID="first_reviewer",
        badgeName="First Reviewer",
        category="reviewer",
        description="Created the first course review.",
        level=1,
        minReviewCount=1,
    ),
    Badge(
        badgeID="active_reviewer",
        badgeName="Active Reviewer",
        category="reviewer",
        description="Created at least 5 course reviews.",
        level=2,
        minReviewCount=5,
    ),
    Badge(
        badgeID="senior_reviewer",
        badgeName="Senior Reviewer",
        category="reviewer",
        description="Created at least 10 course reviews.",
        level=3,
        minReviewCount=10,
    ),
    Badge(
        badgeID="first_replier",
        badgeName="First Replier",
        category="replier",
        description="Created the first reply.",
        level=1,
        minReplyCount=1,
    ),
    Badge(
        badgeID="helpful_replier",
        badgeName="Helpful Replier",
        category="replier",
        description="Created at least 3 replies.",
        level=2,
        minReplyCount=3,
    ),
    Badge(
        badgeID="group_explorer",
        badgeName="Group Explorer",
        category="group_participant",
        description="Submitted the first group application.",
        level=1,
        minApplyCount=1,
    ),
    Badge(
        badgeID="active_group_seeker",
        badgeName="Active Group Seeker",
        category="group_participant",
        description="Submitted at least 3 group applications.",
        level=2,
        minApplyCount=3,
    ),
    Badge(
        badgeID="junior_contributor",
        badgeName="Junior Contributor",
        category="contributor",
        description="Made basic contributions through reviews and replies.",
        level=1,
        minReviewCount=1,
        minReplyCount=1,
        minAchievementScore=3,
    ),
    Badge(
        badgeID="community_contributor",
        badgeName="Community Contributor",
        category="contributor",
        description="Actively contributed through reviews and replies.",
        level=2,
        minReviewCount=3,
        minReplyCount=3,
        minAchievementScore=9,
    ),
    Badge(
        badgeID="senior_contributor",
        badgeName="Senior Contributor",
        category="contributor",
        description="Made strong and consistent contributions to the platform.",
        level=3,
        minReviewCount=5,
        minReplyCount=5,
        minAchievementScore=15,
    ),
]

for badge in badges:
    badge_repo.save(badge)

print("Badge seed completed.")