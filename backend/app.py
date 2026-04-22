from db.mongo import users_collection
from models.user import Student

def test_mongodb_connection():
    print("Connecting to MongoDB...")

    # 1. Create a dummy student using your Python model
    test_student = Student(
        id=999, 
        name="Lu, Shao-Chun", 
        email="test@ntnu.edu.tw", 
        profilePicURL="https://example.com/pic.png", 
        department="Mathematics", 
        studentID="4xxxxxxxxx"
    )

    # 2. Save to the database
    # We use to_dict() to convert the Python object into a format Mongo understands
    users_collection.insert_one(test_student.to_dict())
    print("✅ Successfully inserted student into the database!")

    # 3. Read it back to prove it worked
    found_user = users_collection.find_one({"name": "Lu, Shao-Chun"})
    
    if found_user:
        print(f"✅ Successfully retrieved user from database: {found_user['name']} (Dept: {found_user['department']})")
    else:
        print("❌ Failed to retrieve user.")

if __name__ == "__main__":
    test_mongodb_connection()