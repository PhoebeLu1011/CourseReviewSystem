from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

if not uri:
    raise RuntimeError("MONGO_URI is missing in .env")

if not db_name:
    raise RuntimeError("DB_NAME is missing in .env")

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
)

try:
    client.admin.command("ping")
    print("MongoDB connected successfully.")
except Exception as e:
    print("MongoDB connection failed:", e)
    raise

db = client[db_name]