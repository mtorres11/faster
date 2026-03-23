#!/usr/bin/env bash
# Build the web app (TypeScript → dist), copy assets to www/, and sync to Android & iOS.
# Run from project root: ./update.sh
# For browser-only local dev (no cap sync), use: ./start
set -e
cd "$(dirname "$0")"
echo "Building and syncing..."
npm run copy-web
npx cap sync
echo "Done. www/ is synced to android/ and ios/."
echo "To run on device/emulator: npx cap open android  |  npx cap open ios"
