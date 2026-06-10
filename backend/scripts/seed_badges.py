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
        badgeName="初次評論者",
        category="reviewer",
        description="撰寫了第一篇課程評論。",
        level=1,
        minReviewCount=1,
    ),
    Badge(
        badgeID="active_reviewer",
        badgeName="活躍評論者",
        category="reviewer",
        description="已撰寫至少 5 篇課程評論。",
        level=2,
        minReviewCount=5,
    ),
    Badge(
        badgeID="senior_reviewer",
        badgeName="資深評論者",
        category="reviewer",
        description="已撰寫至少 10 篇課程評論。",
        level=3,
        minReviewCount=10,
    ),
    Badge(
        badgeID="first_replier",
        badgeName="初次回覆者",
        category="replier",
        description="撰寫了第一則討論回覆。",
        level=1,
        minReplyCount=1,
    ),
    Badge(
        badgeID="helpful_replier",
        badgeName="熱心回覆者",
        category="replier",
        description="已撰寫至少 3 則討論回覆。",
        level=2,
        minReplyCount=3,
    ),
    Badge(
        badgeID="group_explorer",
        badgeName="揪人探索者",
        category="group_participant",
        description="送出了第一個找組員申請。",
        level=1,
        minApplyCount=1,
    ),
    Badge(
        badgeID="active_group_seeker",
        badgeName="積極找組員",
        category="group_participant",
        description="已送出至少 3 個找組員申請。",
        level=2,
        minApplyCount=3,
    ),
    Badge(
        badgeID="junior_contributor",
        badgeName="初級貢獻者",
        category="contributor",
        description="透過評論與回覆對平台做出基礎貢獻。",
        level=1,
        minReviewCount=1,
        minReplyCount=1,
        minAchievementScore=3,
    ),
    Badge(
        badgeID="community_contributor",
        badgeName="社群貢獻者",
        category="contributor",
        description="積極透過評論與回覆貢獻社群。",
        level=2,
        minReviewCount=3,
        minReplyCount=3,
        minAchievementScore=9,
    ),
    Badge(
        badgeID="senior_contributor",
        badgeName="資深貢獻者",
        category="contributor",
        description="對平台持續做出豐富而穩定的貢獻。",
        level=3,
        minReviewCount=5,
        minReplyCount=5,
        minAchievementScore=15,
    ),
]

for badge in badges:
    badge_repo.save(badge)

print("Badge seed completed.")