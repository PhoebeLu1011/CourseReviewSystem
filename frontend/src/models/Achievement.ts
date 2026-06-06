export interface Badge {
    badgeID: string;
    badgeName: string;
    category: string;
    description: string;
    level: number;
    minReviewCount: number;
    minReplyCount: number;
    minApplyCount: number;
    minAchievementScore: number;
}

export interface StudentBadgesResponse {
    studentID: string;
    badges: Badge[];
}

export interface AchievementScoreResponse {
    studentID: string;
    achievementScore: number;
    reviewCount: number;
    replyCount: number;
    applyCount: number;
}

export interface CheckBadgesResponse {
    studentID: string;
    newBadges: Badge[];
    currentBadges: Record<string, string>;
}