export interface Discussion {
    _id: string;
    course_id: string;
    student_id: string;
    title: string;
    content: string;
    liked_by: string[];
    likeCount: number;
    created_at: string; 
}