from models.bookmark import BookmarkFactory
from repository.bookmark_repository import BookmarkRepository


class FavoriteService:
    def __init__(
        self,
        bookmark_repo: BookmarkRepository,
        student_repo,
        course_repo,
        bookmark_factory=None,
    ):
        self.bookmark_repo = bookmark_repo
        self.student_repo = student_repo
        self.course_repo = course_repo
        self.bookmark_factory = bookmark_factory or BookmarkFactory()

    def add_bookmark(self, user_id, course_id):
        self._require_student(user_id)
        self._require_course(course_id)
        bookmark = self.bookmark_factory.create(user_id, course_id)
        if not self.bookmark_repo.insert_if_absent(bookmark):
            raise ValueError("Course is already bookmarked.")
        return bookmark

    def remove_bookmark(self, user_id, course_id):
        self._require_student(user_id)
        if not self.bookmark_repo.delete(user_id, course_id):
            raise ValueError("Bookmark not found.")

    def is_bookmarked(self, user_id, course_id):
        return self.bookmark_repo.find_by_user_and_course(user_id, course_id) is not None

    def get_bookmarks_by_user(self, user_id):
        self._require_student(user_id)
        return self.bookmark_repo.find_by_user(user_id)

    def count_bookmarks_for_course(self, course_id):
        self._require_course(course_id)
        return self.bookmark_repo.count_by_course(course_id)

    def _require_student(self, student_id):
        if not self.student_repo.find_by_id(student_id):
            raise ValueError("Student not found.")

    def _require_course(self, course_id):
        if not self.course_repo.find_by_id(course_id):
            raise ValueError("Course not found.")
