#!/usr/bin/env bash

# Frontend Deployment Script
# This script pulls latest code, builds React app, and restarts Nginx

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Configuration
BRANCH="${1:-main}"
PROJECT_DIR="$HOME/end-to-end-backend-testing"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_URL="${BACKEND_URL:-http://13.205.140.236:5000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Start deployment
log "==> Frontend deployment started"

# Navigate to project directory
log "Navigating to project directory..."
cd "$PROJECT_DIR" || { error "Failed to navigate to $PROJECT_DIR"; exit 1; }

# Fetch and pull latest code
log "Fetching latest code from GitHub..."
git fetch --all --prune || { error "Failed to fetch from GitHub"; exit 1; }

log "Checking out branch: $BRANCH"
git checkout "$BRANCH" || { error "Failed to checkout branch $BRANCH"; exit 1; }

log "Pulling latest changes..."
git pull --ff-only origin "$BRANCH" || { error "Failed to pull latest changes"; exit 1; }

# Navigate to frontend directory
log "Navigating to frontend directory..."
cd "$FRONTEND_DIR" || { error "Failed to navigate to frontend directory"; exit 1; }

# Update .env file
log "Updating .env file with backend URL..."
cat > .env << EOF
VITE_API_BASE_URL=$BACKEND_URL
EOF

if [ ! -f .env ]; then
    error "Failed to create .env file"
    exit 1
fi

log "Backend URL set to: $BACKEND_URL"

# Install dependencies if package.json changed
if git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q "package.json\|package-lock.json"; then
    log "package.json changed, running npm install..."
    npm install || { error "npm install failed"; exit 1; }
else
    log "package.json unchanged, skipping npm install"
fi

# Build React application
log "Building React application..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

npm run build || { error "Build failed"; exit 1; }

# Verify build output
if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
    error "Build appears invalid (no index.html in dist). Aborting."
    exit 1
fi

log "Build completed successfully"

# Fix permissions for nginx
log "Setting permissions..."
chmod 755 "$HOME"
chmod -R 755 "$PROJECT_DIR"

# Reload Nginx (zero-downtime reload, not restart)
log "Reloading Nginx..."
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl reload nginx || sudo systemctl restart nginx
    if [ $? -eq 0 ]; then
        log "Nginx reloaded successfully"
    else
        error "Failed to reload Nginx"
        exit 1
    fi
else
    warn "systemctl not found, skipping Nginx reload"
fi

# Verify deployment
log "Verifying deployment..."
if curl -s http://localhost > /dev/null; then
    log "Frontend is responding correctly"
else
    warn "Frontend may not be responding on localhost"
fi

# Deployment complete
log "==> Frontend deployment completed successfully at $(date)"
log "Application is live at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR-EC2-IP')"

exit 0
