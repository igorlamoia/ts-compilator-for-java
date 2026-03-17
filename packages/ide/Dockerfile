# packages/ide/Dockerfile
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./

# Copy packages
COPY packages/compiler ./packages/compiler
COPY packages/ide ./packages/ide

# Install dependencies
RUN npm install

# Build compiler (dependency of ide)
RUN npm run build -w @ts-compilator-for-java/compiler

# Build frontend
WORKDIR /app/packages/ide
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV production

# Copy built files and dependencies from base
COPY --from=base /app ./

EXPOSE 3001

WORKDIR /app/packages/ide
# Run migrations/generate before starting (Prisma)
CMD ["npm", "run", "start"]
