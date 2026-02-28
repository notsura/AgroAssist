from pymongo import MongoClient
import json

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def audit_apple():
    print("--- Searching for 'Apple' in crops ---")
    # Search with regex and without
    all_apples = list(db.crops.find({"name": {"$regex": "apple", "$options": "i"}}))
    print(f"Found {len(all_apples)} crops matching 'apple' (case-insensitive)")
    
    for crop in all_apples:
        name = crop.get('name', 'N/A')
        print(f"ID: {crop['_id']} | Name: '{name}' (length: {len(name)})")
        print(f"Presence of fields:")
        print(f"- routine: {'Yes' if 'routine' in crop else 'No'} (Type: {type(crop.get('routine'))})")
        print(f"- post_harvest: {'Yes' if 'post_harvest' in crop else 'No'}")
        print(f"- active_alerts: {'Yes' if 'active_alerts' in crop else 'No'}")
        
    print("\n--- Current Active Journeys ---")
    for j in db.user_crops.find():
        print(f"User: {j.get('user_id')} | Crop Name: '{j.get('crop_name')}'")

if __name__ == "__main__":
    audit_apple()
