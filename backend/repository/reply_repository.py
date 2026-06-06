from models.discussion import Reply
from bson import ObjectId
from bson.errors import InvalidId


class ReplyRepository:
    def __init__(self, db):
        self.collection = db["replies"]

    def _to_reply(self, data):
        if not data:
            return None

        data.pop("_id", None)
        return Reply(**data)

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

    def find_reply_by_id(self, reply_id):
        data = self.collection.find_one(
            self._visible_query({"replyID": reply_id})
        )
        return self._to_reply(data)

    def find_by_id_or_legacy_id(self, reply_id):
        data = self.collection.find_one({"replyID": reply_id})

        if not data:
            data = self.collection.find_one({"_id": reply_id})

        if not data:
            try:
                data = self.collection.find_one({"_id": ObjectId(reply_id)})
            except (InvalidId, TypeError):
                data = None

        return self._to_reply(data)

    def save_reply(self, reply: Reply):
        self.collection.update_one(
            {"replyID": reply.replyID},
            {"$set": reply.to_dict()},
            upsert=True
        )

    def find_replies_by_discussion_id(self, discussion_id):
        cursor = self.collection.find(
            self._visible_query({"discussionID": discussion_id})
        ).sort("timestamp", 1)
        results = []
        for r in cursor:
            results.append(self._to_reply(r))
        return results

    def find_by_author_id(self, author_id):
        cursor = self.collection.find(
            self._visible_query({"authorID": author_id})
        ).sort("timestamp", -1)
        results = []
        for r in cursor:
            results.append(self._to_reply(r))
        return results

    def delete_reply(self, reply_id):
        self._update_visibility(reply_id, "DELETED")

    def hide_reply(self, reply_id):
        self._update_visibility(reply_id, "HIDDEN")

    def delete_replies_by_discussion(self, discussion_id):
        """Soft-delete all replies belonging to a deleted discussion."""
        self.collection.update_many(
            {"discussionID": discussion_id},
            {"$set": {"visibilityState": "DELETED"}}
        )

    def _update_visibility(self, reply_id, visibility_state):
        update = {"$set": {"visibilityState": visibility_state}}

        result = self.collection.update_one({"replyID": reply_id}, update)
        if result.matched_count:
            return

        result = self.collection.update_one({"_id": reply_id}, update)
        if result.matched_count:
            return

        try:
            self.collection.update_one({"_id": ObjectId(reply_id)}, update)
        except (InvalidId, TypeError):
            return
