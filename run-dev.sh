#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"

if [[ -z "$LAN_IP" ]]; then
  LAN_IP="localhost"
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

echo "Starting frontend..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Play on: http://$LAN_IP:$FRONTEND_PORT"
echo "Backend API: http://$LAN_IP:$BACKEND_PORT"
echo "Health check: http://$LAN_IP:$BACKEND_PORT/api/health"
echo "Press Ctrl+C to stop both servers."

wait -n "$BACKEND_PID" "$FRONTEND_PID"
