#!/bin/bash
# Robert's workspace backup script
# Backs up important files to private GitHub repo

set -e

BACKUP_DIR="/root/.openclaw/workspace/backup-data"
WORKSPACE="/root/.openclaw/workspace"

echo "📦 Starting backup at $(date)"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Copy important files (excluding secrets)
echo "📋 Copying workspace files..."

# Memory and identity
cp -f "$WORKSPACE/MEMORY.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/SOUL.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/USER.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/IDENTITY.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/AGENTS.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/TOOLS.md" "$BACKUP_DIR/" 2>/dev/null || true
cp -f "$WORKSPACE/HEARTBEAT.md" "$BACKUP_DIR/" 2>/dev/null || true

# Memory directory
mkdir -p "$BACKUP_DIR/memory"
cp -rf "$WORKSPACE/memory/"* "$BACKUP_DIR/memory/" 2>/dev/null || true

# Data files (projects, content, etc.)
mkdir -p "$BACKUP_DIR/data"
cp -f "$WORKSPACE/data/projects.json" "$BACKUP_DIR/data/" 2>/dev/null || true
cp -f "$WORKSPACE/data/content.json" "$BACKUP_DIR/data/" 2>/dev/null || true
cp -f "$WORKSPACE/data/activities.json" "$BACKUP_DIR/data/" 2>/dev/null || true
# Don't backup oauth-states.json (contains sensitive tokens)

# Commit and push
cd "$BACKUP_DIR"

# Configure git if needed
git config user.email "robert@robert-claw.com" 2>/dev/null || true
git config user.name "Robert Claw" 2>/dev/null || true

# Add all files
git add -A

# Commit with timestamp
COMMIT_MSG="Backup $(date '+%Y-%m-%d %H:%M:%S UTC')"
if git diff --staged --quiet; then
    echo "✅ No changes to backup"
else
    git commit -m "$COMMIT_MSG"
    git branch -M main
    git push -u origin main --force
    echo "✅ Backup pushed to GitHub"
fi

echo "📦 Backup complete at $(date)"
