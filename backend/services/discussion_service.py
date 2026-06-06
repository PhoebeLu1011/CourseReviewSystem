from models.discussion import Discussion, Reply

class DiscussionService:
    def __init__(self, discussion_repo, reply_repo, student_repo, course_service):
        self.discussion_repo = discussion_repo
        self.reply_repo = reply_repo
        self.student_repo = student_repo
        self.course_service = course_service

    def create_discussion(self, author_id, course_id, title, content):
        new_disc = Discussion(authorID=author_id, courseID=course_id, title=title, content=content)
        self.discussion_repo.save_discussion(new_disc)
        return new_disc.to_dict()

    def get_course_discussions(self, course_id):
        discussions = self.discussion_repo.find_by_course_id(course_id)
        return [d.to_dict() for d in discussions]

    def get_all_discussions(self, search_query=""):
        discussions = self.discussion_repo.find_all_discussions(search_query)
        return [d.to_dict() for d in discussions]

    def add_reply(self, discussion_id, author_id, content):
        discussion = self.discussion_repo.find_discussion_by_id(discussion_id)
        if not discussion:
            raise ValueError("Discussion thread not found.")
        
        new_reply = Reply(discussionID=discussion_id, authorID=author_id, content=content)
        self.reply_repo.save_reply(new_reply)
        
        # Increment the reply counter on the parent thread
        discussion.replyCount += 1
        self.discussion_repo.save_discussion(discussion)
        
        return new_reply.to_dict()

    def get_discussion_replies(self, discussion_id):
        replies = self.reply_repo.find_replies_by_discussion_id(discussion_id)
        return [r.to_dict() for r in replies]

    def handle_discussion_like(self, discussion_id, student_id):
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        if not disc: 
            raise ValueError("Discussion thread not found.")
        disc.toggle_like(student_id)
        self.discussion_repo.save_discussion(disc)
        return disc.likeCount

    def handle_reply_like(self, reply_id, student_id):
        reply = self.reply_repo.find_reply_by_id(reply_id)
        if not reply: 
            raise ValueError("Reply item not found.")
        reply.toggle_like(student_id)
        self.reply_repo.save_reply(reply)
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
        if not disc or disc.authorID != student_id:
            raise ValueError("Unauthorized or discussion not found.")
        disc.title = title
        disc.content = content
        self.discussion_repo.save_discussion(disc)
        return disc.to_dict()

    def delete_discussion(self, discussion_id, student_id):
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        if not disc or disc.authorID != student_id:
            raise ValueError("Unauthorized or discussion not found.")
        
        # 1. Cascading Delete: Wipe all child replies first
        self.reply_repo.delete_replies_by_discussion(discussion_id)
        # 2. Delete the parent discussion
        self.discussion_repo.delete_discussion(discussion_id)
        return True

    def get_user_replies(self, student_id):
        replies = self.reply_repo.find_by_author_id(student_id)
        return [r.to_dict() for r in replies]

    def update_reply(self, reply_id, student_id, content):
        reply = self.reply_repo.find_reply_by_id(reply_id)
        if not reply or reply.authorID != student_id:
            raise ValueError("Unauthorized or reply not found.")
        reply.content = content
        self.reply_repo.save_reply(reply)
        return reply.to_dict()

    def delete_reply(self, reply_id, student_id):
        reply = self.reply_repo.find_reply_by_id(reply_id)
        if not reply or reply.authorID != student_id:
            raise ValueError("Unauthorized or reply not found.")
            
        discussion_id = reply.discussionID
        self.reply_repo.delete_reply(reply_id)
        
        # Decrease parent discussion's reply count
        disc = self.discussion_repo.find_discussion_by_id(discussion_id)
        if disc:
            disc.replyCount = max(0, disc.replyCount - 1)
            self.discussion_repo.save_discussion(disc)
        return True