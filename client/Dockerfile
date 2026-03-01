FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies and clean cache
RUN npm install && npm cache clean --force

COPY . .

ARG VUE_APP_API_URL=/api
ENV VUE_APP_API_URL=${VUE_APP_API_URL}

EXPOSE 8080

CMD ["npm", "run", "serve"]
