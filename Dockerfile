FROM docker:dind

WORKDIR /app

# Install docker-compose and other dependencies
RUN apk add --no-cache docker-compose python3 py3-pip bash curl

# Copy docker-compose.yml and all necessary files
COPY docker-compose.yml .
COPY nginx.conf .
COPY server/ ./server/
COPY client/ ./client/

# Expose ports
EXPOSE 8080

# Start Docker daemon, wait for readiness, then run docker-compose
ENTRYPOINT ["sh", "-c", "set -e && dockerd > /dev/null 2>&1 & sleep 2 && until docker ps > /dev/null 2>&1; do echo 'Waiting for Docker...'; sleep 1; done && echo 'Docker ready!' && exec docker-compose up"]
