FROM node:20-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app source
COPY src ./src

ENV NODE_ENV=production

# Cloud Run sets PORT (ctypically 8080)
EXPOSE 8080

CMD ["node", "src/index.js"]
