FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies and clean cache
RUN npm ci --production --no-optional && npm cache clean --force

COPY . .

# Set NODE_OPTIONS for memory limit
ENV NODE_OPTIONS="--max-old-space-size=200"

EXPOSE 5000

CMD ["npm", "run", "start:seeded"]
