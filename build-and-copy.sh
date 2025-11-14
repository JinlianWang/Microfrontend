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
cp -r dist/* "$NGINX_HTML_DIR/"

echo "Building mfe1..."
cd "$ROOT_DIR/mfe1"
npm install
npm run build
cp -r dist/* "$NGINX_HTML_DIR/mfe1/"

echo "Building mfe2..."
cd "$ROOT_DIR/mfe2"
npm install
npm run build
cp -r dist/* "$NGINX_HTML_DIR/mfe2/"

echo "✅ All apps built and copied to nginx/html/"