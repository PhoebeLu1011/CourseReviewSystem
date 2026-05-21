import uuid
from models.bookmark import Bookmark
from repository.bookmark_repository import BookmarkRepository


class FavoriteService:
    def __init__(self, bookmark_repo: BookmarkRepository):
        self.bookmark_repo = bookmark_repo

    def add_bookmark(self, userId, courseId):
        if self.is_bookmarked(userId, courseId):
            return None
        bookmark = Bookmark(
            bookmarkId=str(uuid.uuid4()),
            userId=userId,
            courseId=courseId
        )
        self.bookmark_repo.save(bookmark)
        return bookmark

    def remove_bookmark(self, userId, courseId):
        self.bookmark_repo.delete(userId, courseId)

    def is_bookmarked(self, userId, courseId):
        return self.bookmark_repo.find_by_user_and_course(userId, courseId) is not None

    def get_bookmarks_by_user(self, userId):
        return self.bookmark_repo.find_by_user(userId)

    def count_bookmarks_for_course(self, courseId):
        return self.bookmark_repo.count_by_course(courseId)
