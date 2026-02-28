from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://agro:agro123@cluster0.artzmzx.mongodb.net/AgroAssist")
client = MongoClient(MONGO_URI)
db = client["AgroAssist"]

docs = []
for doc in db.user_crops.find():
    doc['_id'] = str(doc['_id'])
    # Convert and show types
    dump = {k: f"{v} ({type(v).__name__})" for k, v in doc.items()}
    docs.append(dump)

with open('db_dump.json', 'w') as f:
    json.dump(docs, f, indent=2)

print(f"Dumped {len(docs)} documents to db_dump.json")
