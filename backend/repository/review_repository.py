from models.review import review
class ReviewRepository:
    def __init__(self,db):
        self.collection = db["reviews"]
    def delete_by_id(self, review_id):
        self.collection.delete_one({"reviewID": review_id})
    def reset_visibility(self, review_id):
        self.collection.update_one(
            {"reviewID": review_id},
            {"$set": {"visibilityState": "VISIBLE", "reportCount": 0}}
        )

    def find_by_id(self, review_id): #Find a review in the database by ID. If it exists, clean it up and turn it into a Review object. If not, return nothing.
        data = self.collection.find_one({"reviewID":review_id})
        if not data: return None
        data.pop("_id", None)  # Remove MongoDB's internal ID before returning
        return review(**data)
    

    def save(self, review: review): #Find a review by its ID. If it exists, update it. If it doesn’t, create it.
        self.collection.update_one(
            {"reviewID": review.reviewID},
            {"$set": review.to_dict()},
            upsert=True
        )