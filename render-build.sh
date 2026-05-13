#!/bin/bash
set -e

echo "==> Installing Wasp CLI v0.22..."
npm install @wasp.sh/wasp-cli@0.22.0

echo "==> Building Wasp project..."
npx wasp build

echo "==> Installing server dependencies..."
cd .wasp/build
npm install

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Build complete!"
