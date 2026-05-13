#!/bin/bash
set -e

echo "==> Installing Wasp CLI via npm..."
npm install -g @wasp.sh/wasp-cli

echo "==> Building Wasp project..."
wasp build

echo "==> Installing server dependencies..."
cd .wasp/build
npm install

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Build complete!"
