export type ApplicationStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export interface Application {
    application_id: string;
    student_id: string;
    group_id: string;
    course_id: string | null;
    message: string;
    status: ApplicationStatus;
    apply_time: string;
    reviewed_time: string | null;
    reject_reason: string | null;
}

export interface SubmitApplicationRequest {
    group_id: string;
    message?: string;
}
