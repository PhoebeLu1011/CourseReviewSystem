export interface Reply {
    _id: string;
    discussion_id: string;
    student_id: string;
    content: string;
    liked_by: string[];
    likeCount: number;
    created_at: string;
}