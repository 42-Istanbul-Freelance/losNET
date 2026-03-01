#!/bin/bash

set -e

echo "🔨 Building DinD image..."
docker build -t losev-dind .

echo "🗑️  Removing old container if exists..."
docker rm -f losev-dind 2>/dev/null || true

echo "🚀 Starting DinD container..."
docker run -d \
  --name losev-dind \
  --privileged \
  -p 8080:8080 \
  losev-dind
