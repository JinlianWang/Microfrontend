#!/bin/bash
set -e

ROOT_DIR=$(pwd)
NGINX_HTML_DIR="$ROOT_DIR/nginx/html"

echo "Cleaning up previous builds..."
rm -rf "$NGINX_HTML_DIR"
mkdir -p "$NGINX_HTML_DIR/mfe1"
mkdir -p "$NGINX_HTML_DIR/mfe2"

echo "Building shell..."
cd "$ROOT_DIR/shell"
npm install
npm run build
cp -R dist/. "$NGINX_HTML_DIR/"
if [ -f "$NGINX_HTML_DIR/.vite/manifest.json" ]; then
  cp "$NGINX_HTML_DIR/.vite/manifest.json" "$NGINX_HTML_DIR/manifest.json"
fi

echo "Building mfe1..."
cd "$ROOT_DIR/mfe1"
npm install
npm run build
cp -R dist/. "$NGINX_HTML_DIR/mfe1/"
if [ -f "$NGINX_HTML_DIR/mfe1/.vite/manifest.json" ]; then
  cp "$NGINX_HTML_DIR/mfe1/.vite/manifest.json" "$NGINX_HTML_DIR/mfe1/manifest.json"
fi

echo "Building mfe2..."
cd "$ROOT_DIR/mfe2"
npm install
npm run build
cp -R dist/. "$NGINX_HTML_DIR/mfe2/"
if [ -f "$NGINX_HTML_DIR/mfe2/.vite/manifest.json" ]; then
  cp "$NGINX_HTML_DIR/mfe2/.vite/manifest.json" "$NGINX_HTML_DIR/mfe2/manifest.json"
fi

echo "✅ All apps built and copied to nginx/html/"

cd "$ROOT_DIR"
echo "Starting docker compose (Ctrl+C to stop when ready)..."
docker compose up
