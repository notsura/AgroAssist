from pymongo import MongoClient
from bson import ObjectId
import json

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def test_journey_persistence():
    # Simulate a user ID
    user_id = "697f47cd22d3001ae6b41fb1" # farmer@test.com
    crop_name = "Apple"
    sowing_date = "2026-02-22"
    
    print(f"--- Testing start-followup simulation for {user_id} ---")
    
    # Simulate start_followup logic
    query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]}
    existing = db.user_crops.find_one(query)
    
    update_data = {
        "user_id": user_id, 
        "crop_name": crop_name,
        "sowing_date": sowing_date,
        "started_at": sowing_date,
        "completed_tasks": []
    }

    if existing:
        print(f"Updating existing record: {existing['_id']}")
        db.user_crops.update_one({"_id": existing["_id"]}, {"$set": update_data})
    else:
        print("Inserting new record")
        db.user_crops.insert_one(update_data)
        
    # Verify persistence
    print("\n--- Verifying active-status simulation ---")
    saved = db.user_crops.find_one(query)
    if saved:
        print(f"SUCCESS: Found journey for {saved.get('crop_name')}")
        print(f"User ID in DB: {saved.get('user_id')} ({type(saved.get('user_id'))})")
    else:
        print("FAILURE: No journey found in DB!")

if __name__ == "__main__":
    test_journey_persistence()
