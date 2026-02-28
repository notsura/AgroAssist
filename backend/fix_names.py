from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def cleanup_crops():
    print("--- Cleaning up crop names ---")
    crops = list(db.crops.find())
    for crop in crops:
        original_name = crop.get('name', '')
        clean_name = original_name.strip()
        if original_name != clean_name:
            print(f"Fixing '{original_name}' -> '{clean_name}'")
            db.crops.update_one({"_id": crop["_id"]}, {"$set": {"name": clean_name}})
    
    print("\n--- Cleaning up user crop names ---")
    user_crops = list(db.user_crops.find())
    for uc in user_crops:
        original_name = uc.get('crop_name', '')
        clean_name = original_name.strip()
        if original_name != clean_name:
            print(f"Fixing User Crop '{original_name}' -> '{clean_name}'")
            db.user_crops.update_one({"_id": uc["_id"]}, {"$set": {"crop_name": clean_name}})
            
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup_crops()
