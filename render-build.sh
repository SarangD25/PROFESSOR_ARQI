#!/bin/bash
set -e

echo "==> Installing Wasp CLI..."
curl -sSL https://get.wasp.sh/installer.sh | sh

echo "==> Building Wasp project..."
export PATH="$HOME/.local/bin:$PATH"
wasp build

echo "==> Installing server dependencies..."
cd .wasp/build
npm install

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Build complete!"
