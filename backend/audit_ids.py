from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def audit():
    print("--- Database ID Audit ---")
    crops = list(db.crops.find({}, {"_id": 1, "name": 1}))
    print(f"Total crops: {len(crops)}")
    for c in crops:
        _id = c["_id"]
        name = c["name"]
        id_type = type(_id).__name__
        print(f"ID: {_id!r} | Type: {id_type} | Name: {name}")
        
    pests = list(db.pests.find({}, {"_id": 1, "name": 1}))
    print(f"\nTotal pests: {len(pests)}")
    for p in pests:
        _id = p["_id"]
        name = p["name"]
        id_type = type(_id).__name__
        print(f"ID: {_id!r} | Type: {id_type} | Name: {name}")

if __name__ == "__main__":
    audit()
