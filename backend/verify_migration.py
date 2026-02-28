from pymongo import MongoClient
import os
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def verify():
    print("--- Bio-Intelligence Migration Audit ---")
    
    # Check Pests
    pest_count = db.pests.count_documents({})
    print(f"Total Pests in collection: {pest_count}")
    
    # Check Crops
    crop_count = db.crops.count_documents({})
    print(f"Total Crops in collection: {crop_count}")
    
    # Detailed check for Rice
    rice = db.crops.find_one({"name": "Rice"})
    if rice:
        print(f"\nAudit: Rice ({rice['_id']})")
        pest_ids = rice.get("pests_diseases", [])
        print(f"Linked Pests (IDs): {pest_ids}")
        
        for pid in pest_ids:
            pest = db.pests.find_one({"_id": pid})
            if pest:
                print(f"  - Verified Link: {pest['name']} (Image: {pest.get('image', 'None')})")
            else:
                print(f"  - ❌ BROKEN LINK: {pid}")

    # Detailed check for Wheat
    wheat = db.crops.find_one({"name": "Wheat"})
    if wheat:
        print(f"\nAudit: Wheat ({wheat['_id']})")
        pest_ids = wheat.get("pests_diseases", [])
        print(f"Linked Pests (IDs): {pest_ids}")
        
        for pid in pest_ids:
            pest = db.pests.find_one({"_id": pid})
            if pest:
                print(f"  - Verified Link: {pest['name']} (Image: {pest.get('image', 'None')})")
            else:
                print(f"  - ❌ BROKEN LINK: {pid}")

    print("\n--- Audit Complete ---")

if __name__ == "__main__":
    verify()
