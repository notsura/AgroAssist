from pymongo import MongoClient
import json
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client.agroassist

def inspect_resources():
    resource = db.resources.find_one()
    if resource:
        resource['_id'] = str(resource['_id'])
        print(json.dumps(resource, indent=2))
    else:
        print("No resources found.")

if __name__ == "__main__":
    inspect_resources()
