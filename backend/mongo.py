from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
import gridfs

load_dotenv()

uri = os.getenv("MONGO_URI")

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client[os.getenv("DB_NAME")]
fs = gridfs.GridFS(db)