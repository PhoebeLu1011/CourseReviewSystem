from models.discussion import Reply

class ReplyRepository:
    def __init__(self, db):
        self.collection = db["replies"]

    def find_reply_by_id(self, reply_id):
        data = self.collection.find_one({"replyID": reply_id})
        if not data: return None
        data.pop("_id", None)
        return Reply(**data)

    def save_reply(self, reply: Reply):
        self.collection.update_one(
            {"replyID": reply.replyID},
            {"$set": reply.to_dict()},
            upsert=True
        )

    def find_replies_by_discussion_id(self, discussion_id):
        cursor = self.collection.find({"discussionID": discussion_id}).sort("timestamp", 1)
        results = []
        for r in cursor:
            r.pop("_id", None)
            results.append(Reply(**r))
        return results
    
    def find_by_author_id(self, author_id):
        cursor = self.collection.find({"authorID": author_id}).sort("timestamp", -1)
        results = []
        for r in cursor:
            r.pop("_id", None)
            from models.discussion import Reply
            results.append(Reply(**r))
        return results

    def delete_reply(self, reply_id):
        self.collection.delete_one({"replyID": reply_id})

    def delete_replies_by_discussion(self, discussion_id):
        """Cascading delete: wipes all replies belonging to a deleted discussion."""
        self.collection.delete_many({"discussionID": discussion_id})