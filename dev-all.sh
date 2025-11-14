#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

SHELL_PORT=5173
MFE1_PORT=5174
MFE2_PORT=5175

pids=()

cleanup() {
  if [[ ${#pids[@]} -gt 0 ]]; then
    echo "\nStopping dev servers..." >&2
    for pid in "${pids[@]}"; do
      if kill -0 "$pid" >/dev/null 2>&1; then
        kill "$pid" >/dev/null 2>&1 || true
      fi
    done
  fi
}

trap cleanup INT TERM EXIT

start_app() {
  local name=$1
  local dir=$2
  local port=$3
  echo "Starting $name dev server on port $port"
  (cd "$ROOT_DIR/$dir" && npm run dev -- --port "$port") &
  pids+=("$!")
}

start_app "shell" "shell" "$SHELL_PORT"
start_app "mfe1" "mfe1" "$MFE1_PORT"
start_app "mfe2" "mfe2" "$MFE2_PORT"

echo "\nAll dev servers are running. Access the shell at http://localhost:$SHELL_PORT/"
wait
