export interface Notification {
    notification_id: string;
    receiver_id: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
    related_id: string | null;
}