from models.discussion import Discussion
from pymongo import ReturnDocument
from abc import ABC, abstractmethod

# --- Strategy Pattern Classes ---

class DiscussionSortStrategy(ABC):
    @abstractmethod
    def sort(self, collection_find):
        pass

class RecentSortStrategy(DiscussionSortStrategy):
    def sort(self, collection_find):
        return collection_find.sort("timestamp", -1)

class LikeSortStrategy(DiscussionSortStrategy):
    def sort(self, collection_find):
        return collection_find.sort("likeCount", -1)

class ReplyTimeSortStrategy(DiscussionSortStrategy):
    def sort(self, collection_find):
        # Assumes your Discussion documents have a 'lastReplyAt' field
        return collection_find.sort("lastReplyAt", -1)

# --- Repository Class ---

class DiscussionRepository:
    def __init__(self, db):
        self.collection = db["discussions"]
        # Registry of strategies
        self.strategies = {
            "newest": RecentSortStrategy(),
            "popular": LikeSortStrategy(),
            "active": ReplyTimeSortStrategy()
        }

    def _visible_query(self, query):
        return {
            "$and": [
                query,
                {
                    "$or": [
                        {"visibilityState": "VISIBLE"},
                        {"visibilityState": {"$exists": False}},
                    ]
                },
            ]
        }

    def _to_discussion(self, data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Discussion(**data)

    def find_discussions(self, sort_by="newest", search_query=""):
        """Main entry point for sorted and filtered discussions"""
        query = {}
        if search_query:
            query["$or"] = [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"content": {"$regex": search_query, "$options": "i"}},
                {"courseID": {"$regex": search_query, "$options": "i"}}
            ]
        
        # Get base cursor
        cursor = self.collection.find(self._visible_query(query))
        
        # Apply strategy or default to 'newest'
        strategy = self.strategies.get(sort_by, self.strategies["newest"])
        sorted_cursor = strategy.sort(cursor)
        
        return [self._to_discussion(d) for d in sorted_cursor]

    def find_discussion_by_id(self, discussion_id):
        data = self.collection.find_one(
            self._visible_query({"discussionID": discussion_id})
        )
        return self._to_discussion(data)

    def save_discussion(self, discussion: Discussion):
        self.collection.update_one(
            {"discussionID": discussion.discussionID},
            {"$set": discussion.to_dict()},
            upsert=True
        )

    # Note: Other existing methods like delete_discussion, increment_reply_count, 
    # and toggle_like remain exactly as you had them.