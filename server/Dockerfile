FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies and clean cache
RUN npm install --production --omit=dev && npm cache clean --force

COPY . .

# Set NODE_OPTIONS for memory limit
ENV NODE_OPTIONS="--max-old-space-size=200"

EXPOSE 5000

CMD ["npm", "run", "start:seeded"]
