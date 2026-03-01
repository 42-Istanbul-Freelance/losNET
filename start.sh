#!/bin/bash
# Start MongoDB in the background
echo "🚀 Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db

# Wait for MongoDB to start
until mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; do
  echo "⏳ Waiting for MongoDB to be ready..."
  sleep 2
done
echo "✅ MongoDB is running!"

# Run seeds (as requested)
cd /app/server
echo "🌱 Running seeds..."
npm run seed:admin
npm run seed:demo
echo "✅ Seeds completed!"

# Start the Node Express server
echo "✨ Starting API & Frontend Server..."
npm start
