#!/bin/bash
set -e

echo "==> Installing Wasp CLI..."
npm install @wasp.sh/wasp-cli

echo "==> Building Wasp project..."
npx wasp build

echo "==> Installing server dependencies..."
cd .wasp/build
npm install

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Build complete!"
