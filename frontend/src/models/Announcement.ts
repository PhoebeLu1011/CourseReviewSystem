export interface Announcement {
  announcementID: string;
  title: string;
  content: string;
  tags?: string[];
  target: "all" | "student" | "admin";
  is_pinned: boolean;
  scheduled_at?: string;
  created_by?: string;
  created_at: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  tags?: string[];
  target?: string;
  is_pinned?: boolean;
  scheduled_at?: string;
  created_by?: string;
}
