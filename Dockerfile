FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

RUN mkdir -p /app/documents

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/app.js"]
