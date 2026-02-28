FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VUE_APP_API_URL
ENV VUE_APP_API_URL=${VUE_APP_API_URL}
RUN npm run build

FROM node:18-alpine as production-stage
WORKDIR /app
RUN npm init -y && npm install express connect-history-api-fallback
COPY --from=build-stage /app/dist ./dist
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]
