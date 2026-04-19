# Hukum

Production-ready setup for a multiplayer Hukum game:

- Backend: Express + Socket.IO + Redis
- Frontend: React + Vite

## Project Structure

- `backend/` API + realtime server + Redis state
- `frontend/` web client

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`.

Required for production:

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=3000`
- `CORS_ORIGIN=https://your-frontend-domain.com`
- `REDIS_URL=rediss://...`

Notes:

- `CORS_ORIGIN` supports comma-separated values.
- In production, `REDIS_URL` is mandatory.

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`.

Required:

- `VITE_API_BASE_URL=https://your-backend-domain.com`

## Deploy on Railway + Vercel

Recommended setup:

- Deploy `backend/` to Railway
- Deploy `frontend/` to Vercel

### 1) Backend on Railway

Create a Railway service from the `backend/` directory.

Set these Railway environment variables:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
CORS_ORIGIN=https://your-frontend.vercel.app
REDIS_URL=rediss://default:password@your-upstash-host:6379
```

Notes:

- If you use a custom frontend domain, include it in `CORS_ORIGIN`.
- Multiple origins are allowed as comma-separated values:
  `https://your-frontend.vercel.app,https://play.yourdomain.com`

### 2) Frontend on Vercel

Create a Vercel project from the `frontend/` directory.

Set this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-backend.railway.app
```

Important:

- `VITE_API_BASE_URL` must be the public Railway backend URL (HTTPS).
- After changing envs in Vercel, trigger a redeploy.
- SPA routing is handled by `frontend/vercel.json` rewrite config.

### 3) Post-deploy checks

1. Open frontend URL and create/join a room.
2. Verify backend health: `https://your-backend.railway.app/api/health`
3. Confirm Socket.IO and gameplay updates work across devices.

## Local Development

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server default: `http://localhost:5173`
Backend default: `http://localhost:3000`

## Local WiFi Multiplayer (Same Network)

You can play with friends on the same WiFi without deploying.

### 1) Start backend on your machine

```bash
cd backend
npm run dev
```

### 2) Start frontend on your machine

```bash
cd frontend
npm run dev
```

### 3) Find your machine LAN IP

Linux example:

```bash
hostname -I
```

Suppose your IP is `192.168.1.25`.

### 4) Share frontend URL with friends

- Open on your own device: `http://192.168.1.25:5173`
- Friends open the same URL on their devices.

Notes:

- Frontend now falls back to `http://<current-hostname>:3000` for API in local mode.
- Backend default dev CORS is open (`*`) so same-WiFi devices can connect easily.
- Keep your machine awake and connected to the same WiFi.
- If devices cannot connect, allow ports `5173` and `3000` in your firewall.

## Production Build

### Backend

```bash
cd backend
npm ci
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm ci
npm run build
npm run preview
```

Deploy `frontend/dist` to your static hosting platform.

## Health Check

Backend exposes:

- `GET /api/health`

Response example:

```json
{
  "status": "ok",
  "redisConnected": true
}
```

## Deployment Checklist

1. Set backend envs (`REDIS_URL`, `CORS_ORIGIN`, `PORT`, `NODE_ENV`).
2. Set frontend env (`VITE_API_BASE_URL`) before build.
3. Ensure backend is reachable over HTTPS.
4. Ensure CORS origin matches your frontend domain exactly.
5. Verify `GET /api/health` returns `redisConnected: true`.
