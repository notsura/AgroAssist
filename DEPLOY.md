# Deploy AgroAssist to Render

## Quick Start (Blueprint)

1. Go to [render.com](https://render.com) and connect your GitHub repo.
2. Click **New** → **Blueprint** and select this repo.
3. Render will detect `render.yaml`. Add these **secret** environment variables for the API service:
   - `MONGO_URI` – your MongoDB Atlas connection string
   - `AGMARKNET_API_KEY` – from [data.gov.in](https://data.gov.in)
4. Deploy. The backend deploys first, then the frontend (with the API URL auto-linked).

## Manual Setup

### Backend (Web Service)

- **Root Directory:** `backend`
- **Build:** `pip install -r requirements.txt`
- **Start:** `gunicorn app:app`
- **Environment Variables:**
  - `MONGO_URI` (secret)
  - `AGMARKNET_API_KEY` (secret)
  - `JWT_SECRET_KEY` (generate or set a secure random string)

### Frontend (Static Site)

- **Root Directory:** `frontend`
- **Build:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE` – your backend URL (e.g. `https://agroassist-api.onrender.com`)
  - Or `VITE_API_URL` – full API URL (e.g. `https://agroassist-api.onrender.com/api`)

## Note on Free Tier

- Backend sleeps after 15 min of inactivity; first request may take ~30s to wake.
- File uploads (crops, resources) are stored on the ephemeral filesystem and will be lost on redeploy. For production, consider cloud storage (S3, Cloudinary).
