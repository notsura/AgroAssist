from pymongo import MongoClient
from bson import ObjectId
import os

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def test_insertion():
    print("--- Testing Crop Persistence ---")
    
    test_crop = {
        "name": "Persistence Test Crop",
        "category": "Grain",
        "growing_season": "Kharif",
        "avg_duration": "100 Days",
        "soil_preference": "Loamy",
        "water_requirement": "Moderate",
        "image": "",
        "cultivation_guide": {
            "soil_preparation": "Test",
            "irrigation_guidance": "Test",
            "fertilizer_practices": "Test",
            "seasonal_tips": "Test"
        },
        "pests_diseases": [],
        "routine": [],
        "active_alerts": [],
        "post_harvest": {
            "storage": "Test",
            "cleaning": "Test",
            "soil_prep": "Test",
            "residue": "Test"
        }
    }
    
    # 1. Check if name already exists
    existing = db.crops.find_one({"name": test_crop["name"]})
    if existing:
        print(f"Found existing: {existing['_id']}. Deleting...")
        db.crops.delete_one({"_id": existing["_id"]})
        
    # 2. Insert
    result = db.crops.insert_one(test_crop)
    inserted_id = result.inserted_id
    print(f"Inserted with ID: {inserted_id}")
    
    # 3. Verify
    found = db.crops.find_one({"_id": inserted_id})
    if found:
        print("✅ SUCCESS: Crop found in MongoDB.")
    else:
        print("❌ FAILURE: Crop NOT found in MongoDB immediately after insertion.")
        
    # 4. Check all crops count
    count = db.crops.count_documents({})
    print(f"Total crops in DB: {count}")

if __name__ == "__main__":
    test_insertion()
