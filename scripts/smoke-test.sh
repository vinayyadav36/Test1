#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND="$ROOT/backend"

cd "$BACKEND"
npm install >/dev/null
npm run build >/dev/null
SEED_OUTPUT=$(node dist/scripts/seedDemoUser.js)
USER_ID=$(printf '%s' "$SEED_OUTPUT" | node -e "const input=require('fs').readFileSync(0,'utf8'); const payload=JSON.parse(input); console.log(payload.userId);")
PORT=4010 node dist/index.js >/tmp/sme-json-backend.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID' EXIT
sleep 2
curl --fail --silent http://127.0.0.1:4010/api/health >/dev/null
curl --fail --silent -H "x-demo-user-id: $USER_ID" http://127.0.0.1:4010/api/feedback >/dev/null
printf 'Smoke test passed\n'
