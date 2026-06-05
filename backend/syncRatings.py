import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load the variables from your .env file
load_dotenv()

# Grab the secure URI
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "Course"

print("Connecting to MongoDB Atlas...")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def sync_all_course_ratings():
    print("Connection successful! Starting sync...")
    courses = db.courses.find()
    
    updated_count = 0
    for course in courses:
        course_id = course.get("courseID") or course.get("開課序號")
        
        # Find all VISIBLE reviews for this specific course
        reviews = list(db.reviews.find({
            "courseID": course_id, 
            "visibilityState": "VISIBLE"
        }))
        
        count = len(reviews)
        if count == 0:
            avg_sweet = 0.0
            avg_work = 0.0
        else:
            avg_sweet = sum(r.get("sweetnessScore", 0) for r in reviews) / count
            avg_work = sum(r.get("workloadScore", 0) for r in reviews) / count
            
        # Update the course in the database with the fresh math
        db.courses.update_one(
            {"_id": course["_id"]},
            {"$set": {
                "reviewCount": count,
                "averageSweetness": round(avg_sweet, 1),
                "averageWorkload": round(avg_work, 1)
            }}
        )
        updated_count += 1
        
    print(f"Successfully synced ratings for {updated_count} courses!")

if __name__ == "__main__":
    sync_all_course_ratings()