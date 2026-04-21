# packages/ide/Dockerfile
FROM node:20-slim AS base

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

# Inject NEXT_PUBLIC_API_URL at build time (NEXT_PUBLIC_* vars are baked into the JS bundle)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

# Copy built files and dependencies from base
COPY --from=base /app ./

EXPOSE 3001

WORKDIR /app/packages/ide
CMD ["npm", "run", "start"]
