from models.discussion import Discussion, Reply

class DiscussionService:
    def __init__(self, discussion_repo, reply_repo, student_repo, course_repo):
        self.discussion_repo = discussion_repo
        self.reply_repo = reply_repo
        self.student_repo = student_repo
        self.course_repo = course_repo

    def create_discussion(self, author_id, course_id, title, content):
        self._require_student(author_id)
        if not self.course_repo.find_by_id(course_id):
            raise ValueError("Course not found.")
        new_disc = Discussion(authorID=author_id, courseID=course_id, title=title, content=content)
        self.discussion_repo.save_discussion(new_disc)
        return new_disc.to_dict()

    def get_course_discussions(self, course_id, sort_by="newest"):
        discussions = self.discussion_repo.find_by_course_id(course_id, sort_by)
        return [d.to_dict() for d in discussions]

    def get_all_discussions(self, search_query="", sort_by="newest"):
        discussions = self.discussion_repo.find_discussions(sort_by=sort_by, search_query=search_query)
        return [d.to_dict() for d in discussions]

    def add_reply(self, discussion_id, author_id, content):
        discussion = self.discussion_repo.find_discussion_by_id(discussion_id)
        if not discussion:
            raise ValueError("Discussion thread not found.")
        self._require_student(author_id)

        new_reply = Reply(discussionID=discussion_id, authorID=author_id, content=content)
        self.reply_repo.save_reply(new_reply)

        # Keep the parent count honest if the second write fails.
        try:
            if not self.discussion_repo.increment_reply_count(discussion_id, 1):
                raise ValueError("Discussion thread not found.")
            
            # --- NEW: Update lastReplyAt for the 'active' sorting strategy ---
            self.discussion_repo.collection.update_one(
                {"discussionID": discussion_id},
                {"$set": {"lastReplyAt": new_reply.timestamp}}
            )
        except Exception:
            self.reply_repo.hard_delete_reply(new_reply.replyID)
            raise

        return new_reply.to_dict()

    def get_discussion_replies(self, discussion_id):
        replies = self.reply_repo.find_replies_by_discussion_id(discussion_id)
        return [r.to_dict() for r in replies]

    def handle_discussion_like(self, discussion_id, student_id):
        self._require_student(student_id)
        disc = self.discussion_repo.toggle_like(discussion_id, student_id)
        if not disc:
            raise ValueError("Discussion thread not found.")
        return disc.likeCount

    def handle_reply_like(self, reply_id, student_id):
        self._require_student(student_id)
        reply = self.reply_repo.toggle_like(reply_id, student_id)
        if not reply:
            raise ValueError("Reply item not found.")
        return reply.likeCount
    
    def get_discussion_by_id(self, discussion_id):
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        if not disc:
            raise ValueError("Discussion not found.")
        return disc.to_dict()
    
    def get_user_discussions(self, student_id):
        discussions = self.discussion_repo.find_by_author_id(student_id)
        return [d.to_dict() for d in discussions]

    def update_discussion(self, discussion_id, student_id, title, content):
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        self._require_owner(disc, student_id, "Discussion")
        disc.update_content(title, content)
        self.discussion_repo.save_discussion(disc)
        return disc.to_dict()

    def delete_discussion(self, discussion_id, student_id):
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        self._require_owner(disc, student_id, "Discussion")

        self.reply_repo.delete_replies_by_discussion(discussion_id)
        self.discussion_repo.delete_discussion(discussion_id)
        return True

    def get_user_replies(self, student_id):
        replies = self.reply_repo.find_by_author_id(student_id)
        return [r.to_dict() for r in replies]

    def update_reply(self, reply_id, student_id, content):
        reply = self.reply_repo.find_reply_by_id(reply_id)
        self._require_owner(reply, student_id, "Reply")
        reply.update_content(content)
        self.reply_repo.save_reply(reply)
        return reply.to_dict()

    def delete_reply(self, reply_id, student_id):
        reply = self.reply_repo.find_reply_by_id(reply_id)
        self._require_owner(reply, student_id, "Reply")

        if self.reply_repo.delete_reply(reply_id):
            self.discussion_repo.increment_reply_count(reply.discussionID, -1)
        return True

    def _require_student(self, student_id):
        if not self.student_repo.find_by_id(student_id):
            raise ValueError("Student not found.")

    @staticmethod
    def _require_owner(entity, student_id, entity_name):
        if not entity:
            raise ValueError(f"{entity_name} not found.")
        if entity.authorID != student_id:
            raise PermissionError(f"Only the {entity_name.lower()} author can do this.")