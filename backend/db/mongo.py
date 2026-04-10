from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv("MONGO_URI")

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client[os.getenv("DB_NAME")]
users_collection = db["users"]