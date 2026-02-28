from flask import Flask, jsonify, request, Response, send_from_directory
import urllib.request
import json
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from pymongo import MongoClient
from bson import ObjectId
import certifi
import os
from datetime import timedelta, datetime
from dotenv import load_dotenv
from functools import wraps
from werkzeug.utils import secure_filename

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print(f"Server Startup: AGMARKNET_API_KEY={'found' if os.getenv('AGMARKNET_API_KEY') else 'NOT found'}")

app = Flask(__name__)
# Enable CORS with support for credentials if needed, though simple setup is fine here.
CORS(app)
bcrypt = Bcrypt(app)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-agro-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)
jwt = JWTManager(app)

# MongoDB Configuration - certifi fixes SSL handshake with Atlas on Render
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://agro:agro123@cluster0.artzmzx.mongodb.net/AgroAssist")
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client["AgroAssist"]

# Ensure upload directories exist
CROP_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'public', 'crops')
RESOURCE_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'public', 'resources')

os.makedirs(CROP_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESOURCE_UPLOAD_FOLDER, exist_ok=True)

app.config['CROP_UPLOAD_FOLDER'] = CROP_UPLOAD_FOLDER
app.config['RESOURCE_UPLOAD_FOLDER'] = RESOURCE_UPLOAD_FOLDER
app.config['UPLOAD_FOLDER'] = CROP_UPLOAD_FOLDER  # alias for /api/upload

# --- Helper to serialize MongoDB docs ---
def serialize_doc(doc):
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    
    if isinstance(doc, dict):
        new_doc = {}
        for key, value in doc.items():
            if key == "_id":
                new_doc["_id"] = str(value)
            elif isinstance(value, ObjectId):
                new_doc[key] = str(value)
            elif isinstance(value, (dict, list)):
                new_doc[key] = serialize_doc(value)
            else:
                new_doc[key] = value
        return new_doc
    
    if isinstance(doc, ObjectId):
        return str(doc)
    
    return doc

# --- Market Data Caching ---
market_cache = {
    "data": None,
    "last_updated": None
}

def fetch_mandi_prices():
    # Cache for 1 hour
    now = datetime.now()
    if market_cache["data"] and market_cache["last_updated"] and (now - market_cache["last_updated"]).seconds < 3600:
        return market_cache["data"]

    # AGMARKNET API (data.gov.in)
    API_KEY = os.getenv("AGMARKNET_API_KEY")
    if not API_KEY:
        return []

    # Use the massive variety-wise resource ID
    resource_id = "35985678-0d79-46b4-9ed6-6f13308a1d24"
    
    import datetime as dt
    # Scan last 5 days to find the two most recent active dates
    date_pool = [(now - dt.timedelta(days=i)).strftime("%d/%m/%Y") for i in range(5)]
    
    current_records = []
    previous_records = []
    
    try:
        found_current = False
        for date_str in date_pool:
            url = f"https://api.data.gov.in/resource/{resource_id}?api-key={API_KEY}&format=json&limit=100&filters[Arrival_Date]={date_str}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())
                recs = res_data.get("records", [])
                if not recs:
                    continue
                
                if not found_current:
                    current_records = recs
                    found_current = True
                else:
                    previous_records = recs
                    break # Found Day A and Day B
        
        if not current_records:
            return []

        # Create lookup for previous prices: {(Commodity, Market): price}
        prev_map = {}
        for pr in previous_records:
            key = ( (pr.get('Commodity') or pr.get('commodity')), (pr.get('Market') or pr.get('market')) )
            try:
                prev_map[key] = float(pr.get('Modal_Price') or pr.get('modal_price') or 0)
            except:
                continue

        live_data = []
        for r in current_records:
            commodity = r.get('Commodity') or r.get('commodity')
            variety = r.get('Variety') or r.get('variety')
            market = r.get('Market') or r.get('market')
            if not commodity: continue
            
            # Trend calculation
            try:
                curr_price = float(r.get('Modal_Price') or r.get('modal_price') or 0)
                prev_price = prev_map.get((commodity, market))
                
                if prev_price is None or curr_price == prev_price or curr_price == 0:
                    trend = "Stable"
                elif curr_price > prev_price:
                    trend = "Bullish"
                else:
                    trend = "Bearish"
            except:
                trend = "Stable"
            
            live_data.append({
                "product": f"{commodity} ({variety})",
                "price": f"₹{r.get('Modal_Price') or r.get('modal_price')}/quintal",
                "price_range": f"₹{r.get('Min_Price') or r.get('min_price')} - ₹{r.get('Max_Price') or r.get('max_price')}",
                "mandi": market,
                "state": r.get("State") or r.get("state"),
                "category": "Commodities",
                "is_live": True,
                "trend": trend,
                "stock": 0,
                "arrival_date": r.get("Arrival_Date") or r.get("arrival_date")
            })
        
        market_cache["data"] = live_data
        market_cache["last_updated"] = now
        return live_data
    except Exception as e:
        print(f"AGMARKNET Trend Analysis Error: {e}")
        return []

# --- RBAC Decorator ---
def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"message": "Administrator access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Auth Routes ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    fullname = data.get('fullname')
    state = data.get('state')
    district = data.get('district')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
        
    if db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user_data = {
        "email": email,
        "password": hashed_password,
        "fullname": fullname,
        "state": state,
        "district": district,
        "role": "farmer"
    }
    
    db.users.insert_one(user_data)
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = db.users.find_one({"email": email})
    
    if user and bcrypt.check_password_hash(user['password'], password):
        role = user.get('role', 'farmer')
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={"role": role}
        )
        return jsonify({
            "token": access_token,
            "user": {
                "id": str(user['_id']),
                "email": user['email'],
                "fullname": user.get('fullname'),
                "state": user.get('state'),
                "district": user.get('district'),
                "role": role
            }
        }), 200
        
    return jsonify({"message": "Invalid email or password"}), 401

# --- Existing Routes ---

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/recommend', methods=['POST'])
def recommend_crop():
    data = request.json
    raw_soil = data.get('soil', '')
    raw_season = data.get('season', '')
    raw_water = data.get('water', '') # This is now 'Climate or Rainfall Condition'
    target_crop = data.get('crop', '').strip()
    preferred_category = data.get('category', 'All') # Grain, Fruit, Vegetable, Commercial, or All
    
    # Robust normalization
    soil = raw_soil.split(' ')[0] if raw_soil else 'Alluvial'
    season = raw_season.split(' ')[0] if raw_season else 'Kharif'
    
    # Climate normalization based on new labels
    climate = "Moderate"
    if "High" in raw_water:
        climate = "Hot"
    elif "Arid" in raw_water:
        climate = "Hot"
    elif "Moderate" in raw_water:
        climate = "Moderate"

# Logic 1: Find recommended crops based on suitability mapping in DB
    suitability_match = db.suitability.find_one({
        "soil": soil,
        "season": season,
        "climate": climate
    })
    
    is_exact_match = True
    if not suitability_match:
         is_exact_match = False
         suitability_match = db.suitability.find_one({"season": season})
    
    recommended_names = suitability_match.get("crops", ["Rice", "Wheat", "Maize"]) if suitability_match else ["Rice", "Wheat", "Maize"]
    
    results = []
    
    def get_score(crop_name, is_recommended):
        if is_recommended and is_exact_match:
            return 95 + (int(str(ObjectId())[-1], 16) % 5) # 95-99% for top tier
        
        crop_doc = db.crops.find_one({"name": crop_name})
        if not crop_doc: return 50 # Unknown
        
        score = 0
        creq = crop_doc.get("growing_season", "").lower()
        sreq = crop_doc.get("soil_preference", "").lower()
        wreq = crop_doc.get("water_requirement", "").lower()
        
        # Season Match (33%)
        if season.lower() in creq or ("kharif" in creq and season == "Kharif"):
            score += 33
        elif "rabi" in creq and season == "Winter":
            score += 33
        elif "zaid" in creq and season == "Summer":
            score += 33
            
        # Soil Match (33%)
        if soil.lower() in sreq:
            score += 33
            
        # Climate Match (34%)
        if climate == "Hot" and ("high" in wreq or "very high" in wreq):
            score += 34
        elif climate == "Moderate" and "moderate" in wreq:
            score += 34
        elif climate == "Cool" and "low" in wreq:
            score += 34
        elif climate == "Hot" and "moderate" in wreq:
            score += 15 # Partial
            
        # Base floor for recommended crops
        if is_recommended:
            score = max(score, 82)
            
        return min(score, 100)

    # Step 1: Add recommended crops to results
    for crop_name in recommended_names:
        query = {"name": crop_name}
        if preferred_category != 'All':
            query["category"] = {"$regex": f"^{preferred_category}", "$options": "i"}

        crop_data = db.crops.find_one(query)
        if crop_data:
            score = get_score(crop_name, True)
            results.append({
                "name": crop_name,
                "category": crop_data.get("category"),
                "routine": crop_data.get("routine", []),
                "suitability_percent": score,
                "suitability": "High" if score > 80 else "Moderate",
                "is_recommended": True
            })

    # Step 2: If user suggested a crop, check if it's already in results
    if target_crop:
        is_already_present = any(r['name'].lower() == target_crop.lower() for r in results)
        
        if not is_already_present:
            crop_data = db.crops.find_one({"name": {"$regex": f"^{target_crop}$", "$options": "i"}})
            
            if crop_data:
                score = get_score(crop_data['name'], False)
                results.append({
                    "name": crop_data['name'],
                    "category": crop_data.get("category"),
                    "routine": crop_data.get("routine", []),
                    "suitability_percent": score,
                    "suitability": "High" if score > 80 else ("Moderate" if score > 50 else "Low"),
                    "is_recommended": False,
                    "warning": f"⚠️ Caution: {crop_data['name']} has a {score}% match for your parameters. Traditionally, it faces challenges in {soil} soil during {season}." if score < 80 else None
                })
            else:
                # Totally unknown crop
                results.append({
                    "name": target_crop,
                    "routine": [
                        {"period": "General", "title": "Standard Care", "desc": "Follow local agronomic practices for this variety."},
                        {"period": "Monitoring", "title": "Pest Watch", "desc": "Keep a close eye on unconventional varieties."},
                        {"period": "Harvest", "title": "Maturity", "desc": "Harvest based on local visual indicators."}
                    ],
                    "suitability_percent": 30,
                    "suitability": "Unknown",
                    "is_recommended": False,
                    "warning": f"🚩 Custom Advisory: No historical data for '{target_crop}'. Proceed with calculated risk."
                })

    return jsonify(results)

@app.route('/api/crops', methods=['GET'])
def get_all_crops():
    crops = list(db.crops.find())
    return jsonify([serialize_doc(c) for c in crops])

@app.route('/api/pests', methods=['GET'])
def get_public_pests():
    pests = list(db.pests.find())
    return jsonify([serialize_doc(p) for p in pests])

# --- Admin API Endpoints ---

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    stats = {
        "users": db.users.count_documents({}),
        "crops": db.crops.count_documents({}),
        "posts": db.posts.count_documents({}),
        "market": db.market.count_documents({}),
        "active_journeys": db.user_crops.count_documents({})
    }
    return jsonify(stats)

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_admin_users():
    users = list(db.users.find({}, {"password": 0})) # Exclude passwords
    return jsonify([serialize_doc(u) for u in users])

@app.route('/api/admin/users/<user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    current_status = user.get("status", "active")
    new_status = "blocked" if current_status == "active" else "active"
    
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"status": new_status}})
    return jsonify({"status": new_status}), 200

@app.route('/api/admin/crops', methods=['POST'])
@admin_required
def add_crop():
    data = request.json
    if "_id" in data: del data["_id"]
    
    # Clean name and enforce schema
    if 'name' in data: data['name'] = data['name'].strip()
    data.setdefault('pests_diseases', [])
    data.setdefault('active_alerts', [])
    data.setdefault('routine', [])
    data.setdefault('cultivation_guide', {})
    data.setdefault('post_harvest', {})
    
    pests = data.get('pests_diseases', [])
    result = db.crops.insert_one(data)
    crop_id = str(result.inserted_id)
    
    # Sync to pests
    for pid in pests:
        db.pests.update_one({"_id": ObjectId(pid)}, {"$addToSet": {"affected_crops": crop_id}})
        
    data["_id"] = crop_id
    return jsonify(data), 201

@app.route('/api/admin/crops/<crop_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_crop(crop_id):
    if request.method == 'PUT':
        data = request.json
        if "_id" in data: del data["_id"]
        
        # Sync pests logic
        old_crop = db.crops.find_one({"_id": ObjectId(crop_id)})
        old_pests = set(old_crop.get('pests_diseases', [])) if old_crop else set()
        new_pests = set(data.get('pests_diseases', []))
        
        added = new_pests - old_pests
        removed = old_pests - new_pests
        
        # Clean name and enforce schema on update as well
        if 'name' in data: data['name'] = data['name'].strip()
        data.setdefault('pests_diseases', [])
        data.setdefault('active_alerts', [])
        data.setdefault('routine', [])
        data.setdefault('cultivation_guide', {})
        data.setdefault('post_harvest', {})
        
        db.crops.update_one({"_id": ObjectId(crop_id)}, {"$set": data})
        
        for pid in added:
            try:
                db.pests.update_one({"_id": ObjectId(pid)}, {"$addToSet": {"affected_crops": str(crop_id)}})
            except: pass
        for pid in removed:
            try:
                db.pests.update_one({"_id": ObjectId(pid)}, {"$pull": {"affected_crops": str(crop_id)}})
            except: pass
            
        return jsonify({"message": "Crop updated"}), 200
    
    if request.method == 'DELETE':
        crop = db.crops.find_one({"_id": ObjectId(crop_id)})
        if crop:
            pests = crop.get('pests_diseases', [])
            for pid in pests:
                try:
                    db.pests.update_one({"_id": ObjectId(pid)}, {"$pull": {"affected_crops": str(crop_id)}})
                except: pass
            db.crops.delete_one({"_id": ObjectId(crop_id)})
        return jsonify({"message": "Crop deleted"}), 200

@app.route('/api/admin/pests', methods=['GET', 'POST'])
@admin_required
def admin_pests():
    if request.method == 'GET':
        pests = list(db.pests.find())
        return jsonify([serialize_doc(p) for p in pests])
    
    if request.method == 'POST':
        data = request.json
        data['created_at'] = datetime.now()
        data['updated_at'] = datetime.now()
        
        # Insert pest
        result = db.pests.insert_one(data)
        pest_id = result.inserted_id
        
        # Sync to crops
        affected_crops = data.get('affected_crops', [])
        for crop_id in affected_crops:
            try:
                db.crops.update_one(
                    {"_id": ObjectId(crop_id)},
                    {"$addToSet": {"pests_diseases": str(pest_id)}}
                )
            except: pass
            
        data["_id"] = str(pest_id)
        return jsonify(data), 201

@app.route('/api/admin/pests/<pest_id>', methods=['GET', 'PUT', 'DELETE'])
@admin_required
def manage_pest(pest_id):
    if request.method == 'GET':
        pest = db.pests.find_one({"_id": ObjectId(pest_id)})
        return jsonify(serialize_doc(pest)) if pest else (jsonify({"message": "Not found"}), 404)

    if request.method == 'PUT':
        data = request.json
        data['updated_at'] = datetime.now()
        if "_id" in data: del data["_id"]
        
        # Sync logic
        old_pest = db.pests.find_one({"_id": ObjectId(pest_id)})
        old_crops = set(old_pest.get('affected_crops', [])) if old_pest else set()
        new_crops = set(data.get('affected_crops', []))
        
        added = new_crops - old_crops
        removed = old_crops - new_crops
        
        # Update current pest
        db.pests.update_one({"_id": ObjectId(pest_id)}, {"$set": data})
        
        # Update links in crops
        for cid in added:
            try:
                db.crops.update_one({"_id": ObjectId(cid)}, {"$addToSet": {"pests_diseases": str(pest_id)}})
            except: pass
        for cid in removed:
            try:
                db.crops.update_one({"_id": ObjectId(cid)}, {"$pull": {"pests_diseases": str(pest_id)}})
            except: pass
            
        return jsonify({"message": "Pest updated"}), 200
    
    if request.method == 'DELETE':
        pest = db.pests.find_one({"_id": ObjectId(pest_id)})
        if pest:
            affected_crops = pest.get('affected_crops', [])
            for cid in affected_crops:
                try:
                    db.crops.update_one({"_id": ObjectId(cid)}, {"$pull": {"pests_diseases": str(pest_id)}})
                except: pass
            db.pests.delete_one({"_id": ObjectId(pest_id)})
        return jsonify({"message": "Pest deleted"}), 200

# Serve uploaded files (crops, resources) - needed when frontend is on different domain
@app.route('/crops/<path:filename>')
def serve_crop(filename):
    return send_from_directory(app.config['CROP_UPLOAD_FOLDER'], filename)

@app.route('/resources/<path:filename>')
def serve_resource(filename):
    return send_from_directory(app.config['RESOURCE_UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file:
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = secure_filename(f"crop_{int(datetime.now().timestamp())}.{ext}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        base = (os.getenv("BACKEND_URL") or os.getenv("RENDER_EXTERNAL_URL", "")).rstrip("/")
        url = f"{base}/crops/{filename}" if base else f"/crops/{filename}"
        return jsonify({"url": url}), 200

@app.route('/api/posts', methods=['GET', 'POST'])
def handle_posts():
    if request.method == 'GET':
        posts = list(db.posts.find().sort("_id", -1))
        return jsonify([serialize_doc(p) for p in posts])
    
    if request.method == 'POST':
        data = request.json
        new_post = {
            "author": data.get("author", "Anonymous"),
            "content": data.get("content"),
            "topic": data.get("topic", "General"),
            "image_url": data.get("image_url"), # Optional photo
            "timestamp": data.get("timestamp", "Just now"),
            "likes": [], # List of user IDs
            "comments": [], # List of comment objects
            "shares": 0
        }
        result = db.posts.insert_one(new_post)
        new_post["_id"] = str(result.inserted_id)
        return jsonify(new_post), 201

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    user_id = get_jwt_identity()
    post = db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        return jsonify({"message": "Post not found"}), 404
        
    likes = post.get("likes", [])
    if user_id in likes:
        likes.remove(user_id)
    else:
        likes.append(user_id)
        
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$set": {"likes": likes}})
    return jsonify({"likes": likes}), 200

@app.route('/api/posts/<post_id>/comment', methods=['POST'])
@jwt_required()
def comment_post(post_id):
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    data = request.json
    content = data.get("content")
    
    if not content:
        return jsonify({"message": "Comment content is required"}), 400
        
    comment = {
        "author": user.get("fullname", "Anonymous"),
        "content": content,
        "timestamp": "Just now"
    }
    
    db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment}}
    )
    return jsonify(comment), 200

# --- Admin Community Moderation ---

@app.route('/api/admin/posts', methods=['GET'])
@admin_required
def admin_get_posts():
    posts = list(db.posts.find().sort("_id", -1))
    return jsonify([serialize_doc(p) for p in posts])

@app.route('/api/admin/posts/<post_id>', methods=['DELETE'])
@admin_required
def admin_delete_post(post_id):
    try:
        query = {"_id": ObjectId(post_id)}
    except:
        return jsonify({"message": "Invalid ID format"}), 400
        
    result = db.posts.delete_one(query)
    if result.deleted_count == 0:
        return jsonify({"message": "Post not found"}), 404
        
    return jsonify({"message": "Post deleted successfully"}), 200

@app.route('/api/admin/posts/<post_id>/comments/<int:comment_index>', methods=['DELETE'])
@admin_required
def admin_delete_comment(post_id, comment_index):
    try:
        post = db.posts.find_one({"_id": ObjectId(post_id)})
    except:
        return jsonify({"message": "Invalid post ID format"}), 400
        
    if not post:
        return jsonify({"message": "Post not found"}), 404
        
    comments = post.get("comments", [])
    if comment_index < 0 or comment_index >= len(comments):
        return jsonify({"message": "Comment index out of range"}), 400
        
    # Remove by index
    removed_comment = comments.pop(comment_index)
    
    db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"comments": comments}}
    )
    
    return jsonify({"message": "Comment removed", "removed": removed_comment}), 200

@app.route('/api/market', methods=['GET'])
def get_market():
    # Fetch seeded data
    market_data = list(db.market.find())
    serialized_data = [serialize_doc(m) for m in market_data]
    
    # Enrich with live data from AGMARKNET
    live_prices = fetch_mandi_prices()
    
    # Merge: Prioritize live data if available
    return jsonify(live_prices + serialized_data)

@app.route('/api/resources', methods=['GET'])
def get_resources():
    resources = list(db.resources.find())
    return jsonify([serialize_doc(r) for r in resources])

# --- Admin Resources Management ---

@app.route('/api/admin/resources/upload', methods=['POST'])
@admin_required
def upload_resource_image():
    if 'image' not in request.files:
        return jsonify({"message": "No image part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
        
    if file:
        filename = secure_filename(f"res_{int(datetime.now().timestamp())}_{file.filename}")
        file.save(os.path.join(app.config['RESOURCE_UPLOAD_FOLDER'], filename))
        base = (os.getenv("BACKEND_URL") or os.getenv("RENDER_EXTERNAL_URL", "")).rstrip("/")
        url = f"{base}/resources/{filename}" if base else f"/resources/{filename}"
        return jsonify({"url": url}), 200

@app.route('/api/admin/resources', methods=['POST'])
@admin_required
def add_resource():
    data = request.json
    if not data.get('product') or not data.get('category'):
        return jsonify({"message": "Product name and category are required"}), 400
    
    # Ensure fields are initialized
    data.setdefault('suitable_crops', [])
    data.setdefault('usage_stage', '')
    data.setdefault('price_range', '')
    data.setdefault('guidance', '')
    data.setdefault('availability', 'In Stock')
    data.setdefault('desc', '')

    result = db.resources.insert_one(data)
    return jsonify({"message": "Resource added successfully", "id": str(result.inserted_id)}), 201

@app.route('/api/admin/resources/<id>', methods=['PUT'])
@admin_required
def update_resource(id):
    data = request.json
    try:
        query = {"_id": ObjectId(id)}
    except:
        return jsonify({"message": "Invalid ID format"}), 400

    existing = db.resources.find_one(query)
    if not existing:
        return jsonify({"message": "Resource not found"}), 404

    # Update only provided fields
    db.resources.update_one(query, {"$set": data})
    return jsonify({"message": "Resource updated successfully"}), 200

@app.route('/api/admin/resources/<id>', methods=['DELETE'])
@admin_required
def delete_resource(id):
    try:
        query = {"_id": ObjectId(id)}
    except:
        return jsonify({"message": "Invalid ID format"}), 400

    result = db.resources.delete_one(query)
    if result.deleted_count == 0:
        return jsonify({"message": "Resource not found"}), 404
        
    return jsonify({"message": "Resource deleted successfully"}), 200

# --- Day-by-Day Follow-up Routes ---

@app.route('/api/user/start-followup', methods=['POST'])
@jwt_required()
def start_followup():
    user_id = get_jwt_identity()
    data = request.json
    crop_name = data.get('crop_name')
    sowing_date = data.get('sowing_date') # ISO format string like "2026-02-03"
    
    if not crop_name or not sowing_date:
        return jsonify({"message": "Crop name and sowing date are required"}), 400
        
    # Find existing journey type-agnotically
    try:
        query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]}
    except:
        query = {"user_id": user_id}
    
    existing = db.user_crops.find_one(query)
    
    update_data = {
        "user_id": user_id, # Ensure it's stored as string
        "crop_name": crop_name,
        "sowing_date": sowing_date,
        "started_at": sowing_date,
        "completed_tasks": [] # Reset for new journey
    }

    if existing:
        print(f"DEBUG: Updating existing journey for user {user_id}. Old crop: {existing.get('crop_name')}, New: {crop_name}")
        db.user_crops.update_one({"_id": existing["_id"]}, {"$set": update_data})
    else:
        print(f"DEBUG: Creating new journey for user {user_id} with crop {crop_name}")
        db.user_crops.insert_one(update_data)

    print(f"DEBUG: Journey updated in DB for {user_id} with crop {crop_name}")
    return jsonify({"message": f"Journey for {crop_name} started!"}), 200

@app.route('/api/user/active-status', methods=['GET'])
@jwt_required()
def get_active_status():
    user_id = get_jwt_identity()
    try:
        query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]}
    except:
        query = {"user_id": user_id}

    user_crop = db.user_crops.find_one(query)
    print(f"DEBUG: Fetching status for token identity: {user_id}")
    print(f"DEBUG: Query: {query}")
    print(f"DEBUG: Found Journey: {user_crop.get('crop_name') if user_crop else 'None'}")
    
    if not user_crop:
        return jsonify({
            "active": False, 
            "debug_user_id": user_id,
            "message": "No active journey found in database for this user identity."
        }), 200
        
    from datetime import datetime
    sowing_date = datetime.fromisoformat(user_crop['sowing_date'])
    today = datetime.now()
    days_since_sowing = (today - sowing_date).days + 1 # Day 1 is the sowing day
    
    # Case-insensitive lookup for routine with name stripping
    import re
    search_name = user_crop['crop_name'].strip()
    crop_data = db.crops.find_one({"name": {"$regex": f"^{re.escape(search_name)}$", "$options": "i"}})
    if not crop_data:
        return jsonify({
            "active": True, 
            "crop_name": search_name,
            "error": f"Crop data for '{search_name}' not found",
            "routine": [],
            "days_since_sowing": days_since_sowing,
            "current_task": None,
            "next_task": None
        }), 404
        
    current_task = None
    routine = crop_data.get('routine') or []
    for step in routine:
        if step['start_day'] <= days_since_sowing <= step['end_day']:
            current_task = step
            break
            
    # Also find next task
    next_task = None
    for step in routine:
        if step['start_day'] > days_since_sowing:
            next_task = step
            break
            
    return jsonify(serialize_doc({
        "active": True,
        "crop_name": user_crop['crop_name'],
        "days_since_sowing": days_since_sowing,
        "current_task": current_task,
        "next_task": next_task,
        "routine": routine,
        "post_harvest": crop_data.get("post_harvest"), # Include post-harvest intelligence
        "completed_tasks": user_crop.get("completed_tasks", []), # List of task titles or IDs
        "debug_user_id": user_id
    }))

@app.route('/api/user/complete-journey', methods=['POST'])
@jwt_required()
def complete_journey():
    user_id = get_jwt_identity()
    try:
        query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]}
    except:
        query = {"user_id": user_id}

    user_crop = db.user_crops.find_one(query)
    if not user_crop:
        return jsonify({"message": "No active journey to complete"}), 404

    # Archive to history
    from datetime import datetime
    sowing_date = datetime.fromisoformat(user_crop['sowing_date'])
    today = datetime.now()
    days_since_sowing = (today - sowing_date).days + 1

    history_entry = {
        "user_id": user_id,
        "crop_name": user_crop['crop_name'],
        "start_date": user_crop['sowing_date'],
        "completion_date": today.isoformat(),
        "duration": days_since_sowing,
        "status": "Harvested"
    }
    
    db.farming_history.insert_one(history_entry)
    db.user_crops.delete_one({"_id": user_crop["_id"]})
    
    return jsonify({"message": "Journey archived successfully!", "history": serialize_doc(history_entry)}), 200

@app.route('/api/user/history', methods=['GET'])
@jwt_required()
def get_farming_history():
    user_id = get_jwt_identity()
    history = list(db.farming_history.find({"user_id": user_id}).sort("completion_date", -1))
    return jsonify([serialize_doc(h) for h in history])

@app.route('/api/user/toggle-task', methods=['POST'])
@jwt_required()
def toggle_task():
    user_id = get_jwt_identity()
    data = request.json
    task_title = data.get('task_title')
    
    if not task_title:
        return jsonify({"message": "Task title is required"}), 400
        
    try:
        query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]}
    except:
        query = {"user_id": user_id}

    user_crop = db.user_crops.find_one(query)
    if not user_crop:
        return jsonify({"message": "No active journey"}), 404
        
    completed = user_crop.get("completed_tasks", [])
    if task_title in completed:
        completed.remove(task_title)
    else:
        completed.append(task_title)
        
    db.user_crops.update_one(
        {"user_id": user_id},
        {"$set": {"completed_tasks": completed}}
    )
    return jsonify({"completed_tasks": completed}), 200

@app.route('/api/ai/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    data = request.json
    user_query = data.get('message', '')
    
    system_prompt = (
        "You are AgroAssist, an agricultural AI advisor. "
        "Help farmers with questions related to crops, soil health, fertilizers, irrigation, "
        "pest and disease control, agricultural markets, and government farming schemes. "
        "Provide practical and simple farming advice. "
        "If a question is not related to agriculture, respond with: "
        "'I can only help with agriculture and farming related questions.'"
    )
    
    def generate():
        try:
            print(f"AI Streaming Hit - Query: {user_query}")
            ollama_url = "http://127.0.0.1:11434/api/chat"
            payload = {
                "model": "mistral:latest",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "stream": True # Enable streaming
            }
            
            # Explicitly disable proxies
            proxy_handler = urllib.request.ProxyHandler({})
            opener = urllib.request.build_opener(proxy_handler)
            
            req = urllib.request.Request(
                ollama_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            with opener.open(req, timeout=120) as response:
                for line in response:
                    if line:
                        resp_data = json.loads(line.decode('utf-8'))
                        chunk = resp_data.get('message', {}).get('content', '')
                        if chunk:
                            yield chunk
                            
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"Ollama Streaming Error:\n{error_detail}")
            yield f"Error: {str(e)}"

    return Response(generate(), mimetype='text/plain')

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    district = request.args.get('district')
    
    location_name = district or "Saharanpur"
    
    # Priority 1: GPS Coordinates
    if not (lat and lon):
        # Priority 2: Geocode District
        if district:
            try:
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(district)}&count=1&language=en&format=json"
                with urllib.request.urlopen(geo_url) as geo_resp:
                    geo_data = json.loads(geo_resp.read().decode())
                    results = geo_data.get("results", [])
                    if results:
                        lat = results[0].get("latitude")
                        lon = results[0].get("longitude")
                        location_name = results[0].get("name", district)
            except Exception as e:
                print(f"Geocoding Error for {district}: {e}")
        
        # Priority 3: Fallback to Saharanpur
        if not (lat and lon):
            lat, lon = 29.968, 77.545
            location_name = "Saharanpur"

    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            
            cw = data.get("current_weather", {})
            daily = data.get("daily", {})
            
            # Simple WMO Code mapping
            def map_weather(code):
                mapping = {
                    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
                    45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 61: "Slight Rain",
                    63: "Moderate Rain", 65: "Heavy Rain", 95: "Thunderstorm"
                }
                return mapping.get(code, "Clear Sky")

            weather_response = {
                "location": location_name,
                "current": {
                    "temp": f"{int(cw.get('temperature', 24))}°",
                    "condition": map_weather(cw.get('weathercode', 0)),
                    "wind": f"{int(cw.get('windspeed', 12))} km/h",
                    "last_updated": "Just now"
                },
                "forecast": []
            }

            # Map 5-day forecast
            days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            from datetime import datetime
            
            for i in range(5):
                date_str = daily.get("time", [])[i]
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                day_name = days[date_obj.weekday()]
                
                weather_response["forecast"].append({
                    "day": day_name,
                    "temp": f"{int(daily.get('temperature_2m_max', [])[i])}°",
                    "condition": map_weather(daily.get('weathercode', [])[i])
                })

            return jsonify(weather_response)
    except Exception as e:
        print(f"Weather Fetch Error: {e}")
        return jsonify({"error": "Weather data unavailable"}), 500

# --- Smart Alerts & Regional Broadcasting ---

@app.route('/api/admin/alerts', methods=['POST'])
@admin_required
def create_alert():
    data = request.json
    alert = {
        "title": data.get("title"),
        "crop": data.get("crop"),
        "region": data.get("region"),
        "state": data.get("state"),
        "severity": data.get("severity"),
        "message": data.get("message"),
        "created_at": datetime.utcnow()
    }
    result = db.alerts.insert_one(alert)
    alert["_id"] = str(result.inserted_id)
    return jsonify(serialize_doc(alert)), 201

@app.route('/api/admin/alerts', methods=['GET'])
@admin_required
def get_admin_alerts():
    alerts = list(db.alerts.find().sort("created_at", -1))
    return jsonify(serialize_doc(alerts))

@app.route('/api/admin/alerts/<alert_id>', methods=['DELETE'])
@admin_required
def delete_alert(alert_id):
    db.alerts.delete_one({"_id": ObjectId(alert_id)})
    return jsonify({"message": "Alert deleted"}), 200

@app.route('/api/admin/alerts/automated', methods=['GET'])
@admin_required
def get_automated_alerts():
    # Example logic: check weather for a few key regions
    regions = ["Saharanpur", "Pune", "Ludhiana"]
    suggestions = []
    
    for region in regions:
        try:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(region)}&count=1&language=en&format=json"
            req = urllib.request.Request(geo_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as geo_resp:
                geo_data = json.loads(geo_resp.read().decode())
                results = geo_data.get("results", [])
                if results:
                    lat = results[0].get("latitude")
                    lon = results[0].get("longitude")
                    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m"
                    req2 = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req2) as response:
                        data = json.loads(response.read().decode())
                        humidity = data.get("hourly", {}).get("relativehumidity_2m", [50])[0]
                        cw = data.get("current_weather", {})
                        temp = cw.get("temperature", 25)
                        
                        if humidity > 80:
                            suggestions.append({
                                "title": "Fungal Infection Warning",
                                "crop": "Rice",
                                "region": region,
                                "severity": "High",
                                "message": f"High risk of fungal infection detected due to high humidity ({humidity}%). Preventative spraying recommended."
                            })
                        if temp > 35:
                            suggestions.append({
                                "title": "Heat Stress Alert",
                                "crop": "Wheat",
                                "region": region,
                                "severity": "Medium",
                                "message": f"High temperatures ({temp}°C) may cause heat stress. Ensure adequate irrigation."
                            })
        except Exception as e:
            print(f"Automated Alert Error config for {region}: {e}")
            pass
            
    # Add a fallback suggestion if API fails or no conditions met
    if not suggestions:
        suggestions.append({
            "title": "Pest Migration Alert",
            "crop": "Cotton",
            "region": "All Regions",
            "severity": "Medium",
            "message": "Favorable conditions for Pink Bollworm detected. Begin deploying pheromone traps."
        })
        
    return jsonify(suggestions)

@app.route('/api/user/alerts', methods=['GET'])
@jwt_required()
def get_user_alerts():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    district = user.get("district", "Unknown").strip().lower()
    state = user.get("state", "Unknown").strip().lower()
    
    active_crop = ""
    status = db.user_status.find_one({"user_id": user_id, "active": True})
    if status:
        active_crop = status.get("crop_name", "").strip().lower()
        
    alerts = list(db.alerts.find().sort("created_at", -1))
    
    filtered_alerts = []
    for a in alerts:
        a_region = (a.get("region") or "").strip().lower()
        a_state = (a.get("state") or "").strip().lower()
        a_crop = (a.get("crop") or "").strip().lower()
        
        region_match = a_region in ["", "all", "all regions", "any"] or a_region == district
        state_match = a_state in ["", "all", "any"] or a_state == state
        crop_match = a_crop in ["", "all", "all crops", "any"] or a_crop == active_crop
        
        # Cross-match for region/state in case of swap or missing fields
        any_location_match = region_match or state_match or a_region == state or a_state == district
        
        # Determine if it's relevant to this user based on their active crop, region, or state
        if crop_match and any_location_match:
            filtered_alerts.append(a)
            
    return jsonify(serialize_doc(filtered_alerts))

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
