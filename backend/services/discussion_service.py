from repository.discussion_repository import DiscussionRepository
from repository.reply_repository import ReplyRepository
from repository.student_repository import StudentRepository
from models.discussion import Discussion
from models.reply import Reply

class DiscussionService:
    def __init__(self, discussion_repo: DiscussionRepository, reply_repo: ReplyRepository, student_repo: StudentRepository, course_service):
        self.discussion_repo = discussion_repo
        self.reply_repo = reply_repo
        self.student_repo = student_repo
        self.course_service = course_service

    # DISCUSSION THREAD LOGIC
   

    def create_discussion(self, course_id, student_id, title, content):
        # 1. Verify the student exists
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found.")
        
        # 2. Verify the course exists (assuming course_service handles this)
        course = self.course_service.get_course_by_id(course_id)
        if not course:
            raise ValueError("Course not found.")

        # 3. Create and save the new thread
        new_discussion = Discussion(
            course_id=course_id,
            student_id=student_id,
            title=title,
            content=content
        )
        self.discussion_repo.save(new_discussion)
        
        return new_discussion.to_dict()

    def handle_discussion_like(self, discussion_id, student_id):
        discussion = self.discussion_repo.find_by_id(discussion_id)
        if not discussion:
            raise ValueError("Discussion not found.")
        
        discussion.toggle_like(student_id)
        self.discussion_repo.save(discussion)
        
        return len(discussion.liked_by)

    def get_discussions_by_course(self, course_id, sort_by="newest", limit=10, skip=0):
        return self.discussion_repo.find_by_course_id(course_id, sort_by, limit, skip)




    # REPLY LOGIC
   

    def create_reply(self, discussion_id, student_id, content):
        # 1. Verify the student exists
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found.")
        
        # 2. Verify the parent discussion thread actually exists
        discussion = self.discussion_repo.find_by_id(discussion_id)
        if not discussion:
            raise ValueError("Parent discussion thread not found.")

        # 3. Create and save the reply
        new_reply = Reply(
            discussion_id=discussion_id,
            student_id=student_id,
            content=content
        )
        self.reply_repo.save(new_reply)
        
        return new_reply.to_dict()

    def handle_reply_like(self, reply_id, student_id):
        reply = self.reply_repo.find_by_id(reply_id)
        if not reply:
            raise ValueError("Reply not found.")
        
        reply.toggle_like(student_id)
        self.reply_repo.save(reply)
        
        return len(reply.liked_by)

    def get_replies_for_discussion(self, discussion_id, sort_by="newest", limit=20, skip=0):
        return self.reply_repo.find_by_discussion_id(discussion_id, sort_by, limit, skip)