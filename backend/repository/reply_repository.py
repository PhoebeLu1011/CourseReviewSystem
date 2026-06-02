from models.reply import Reply

class ReplyRepository:
    def __init__(self, db):
        self.collection = db["replies"]

    def delete_by_id(self, reply_id):
        self.collection.delete_one({"_id": reply_id})

    def find_by_id(self, reply_id):
        data = self.collection.find_one({"_id": reply_id})
        if not data: return None
        
        data.pop("_id", None)
        return Reply(**data)

    def save(self, reply: Reply):
        self.collection.update_one(
            {"_id": reply.reply_id},
            {"$set": reply.to_dict()},
            upsert=True
        )

    def find_by_discussion_id(self, discussion_id, sort_by="newest", limit=20, skip=0):
        query = {
            "discussion_id": discussion_id
        }

        # sort by newwest or most liked
        if sort_by == "popular":
            sort_logic = [("likeCount", -1), ("created_at", -1)]
        else:
            sort_logic = [("created_at", -1)] 

        cursor = self.collection.find(query).sort(sort_logic).skip(skip).limit(limit)
        replies = []
        for data in cursor:
            data.pop("_id", None)
            replies.append(Reply(**data))
        return replies