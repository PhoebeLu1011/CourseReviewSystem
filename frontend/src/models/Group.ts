export type GroupStatus = "open" | "closed";

export interface Group {
    group_id: string;
    group_name: string;
    course_id: string;
    leader_id: string;
    max_members: number;
    needed_members?: number;
    members: string[];
    status: GroupStatus;
    recruitment_deadline: string | null;
    description: string | null;
    tags: string[];
    recommendation_score?: number;
}

export interface RecommendedGroupDTO extends Group {
    recommendation_score: number;
}
