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
