# Build Stage for Frontend
FROM node:18-bullseye AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
# Serve via relative /api path
ARG VUE_APP_API_URL=/api
ENV VUE_APP_API_URL=${VUE_APP_API_URL}
RUN npm run build

# Final Stage: Monolith
FROM node:18-bullseye
WORKDIR /app

# Install MongoDB
RUN apt-get update && apt-get install -y gnupg wget
RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
RUN apt-get update && apt-get install -y mongodb-org

# Create directories
RUN mkdir -p /data/db /app/server/uploads /var/log/mongodb

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy server code
COPY server/ ./server/

# Copy built frontend
COPY --from=client-build /app/client/dist ./client/dist

# Copy entrypoint script
COPY start.sh .
RUN chmod +x start.sh

# Environment Variables
ENV PORT=5000
ENV MONGO_URI=mongodb://127.0.0.1:27017/losev-net
ENV NODE_ENV=production

# Expose only the application port
EXPOSE 5000

CMD ["./start.sh"]
