# 🛠️ Gugu Backend API

The backend is built with [Hono](https://hono.dev) and runs on [Cloudflare Workers](https://workers.cloudflare.com) backed by [Cloudflare D1](https://developers.cloudflare.com/d1) (serverless SQLite).

---

## 🚀 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run local database migrations:**
   ```bash
   npm run db:migrate:local
   ```

3. **Start local dev server:**
   ```bash
   npm run dev
   ```
   API will be running on `http://127.0.0.1:8787`.

---

## 🌐 Cloudflare Deployment Guide

To deploy the backend to production on Cloudflare Workers:

### Step 1: Login to Cloudflare
```bash
npx wrangler login
```

### Step 2: Create your Cloudflare D1 Database
```bash
npx wrangler d1 create gugu-db
```
This command outputs your unique `database_id`, for example:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 3: Update `wrangler.toml`
Paste the `database_id` from Step 2 into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gugu-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### Step 4: Apply Schema to Remote Database
> **Important:** This step creates the required database tables (`users`, `mood_logs`, `patient_summaries`, `therapy_requests`, etc.) in the Cloudflare D1 cloud database.
```bash
npm run db:migrate:remote
```

### Step 5: Deploy the Worker
```bash
npm run deploy
```

Once deployed, Cloudflare will output your live API URL:
```
https://gugu-backend.<your-subdomain>.workers.dev
```

### Step 6: Connect Frontend
In your frontend deployment (e.g. Vercel / Netlify environment variables) or in `frontend/.env`:
```env
VITE_API_URL="https://gugu-backend.<your-subdomain>.workers.dev"
```

---

## 📡 API Endpoints

- **Health Check:** `GET /`
- **Auth:**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Patient & Escalation:**
  - `POST /api/summaries`
  - `GET /api/summaries`
  - `PATCH /api/summaries/:id/status`
- **Therapy Requests (AI Matching):**
  - `POST /api/therapy-requests`
  - `GET /api/therapy-requests/pending`
  - `GET /api/therapy-requests/my`
  - `PATCH /api/therapy-requests/:id/approve`
  - `PATCH /api/therapy-requests/:id/reject`
  - `PATCH /api/therapy-requests/:id/schedule`
- **Therapists & Appointments:**
  - `GET /api/therapists`
  - `GET /api/appointments`
  - `GET /api/appointments/patient`
  - `POST /api/appointments`
- **Mood Tracking:**
  - `POST /api/mood`
  - `GET /api/mood/history`
  - `GET /api/dashboard`
- **Clinical Notes:**
  - `GET /api/notes`
  - `POST /api/notes`
  - `DELETE /api/notes/:id`

