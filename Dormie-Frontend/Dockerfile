###############################################################################
# 1️⃣  DEVELOPMENT – hot-reload container
###############################################################################
FROM node:18-alpine AS development
WORKDIR /app

# Global pnpm once (kept in its own layer)
RUN npm install -g pnpm

# Copy lock-files first for better cache hits
COPY package.json pnpm-lock.yaml ./
RUN pnpm install            # installs into /app/node_modules

# Copy sources for live coding
COPY . .

EXPOSE 3000
CMD ["pnpm", "run", "dev"]


################ 2. build (Next.js) ################
FROM node:18-alpine AS build
WORKDIR /app
RUN npm i -g pnpm

# Copy package files first for better cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code
COPY . .

# Build the application for production
RUN pnpm run build
####################################################

################ 3. prod (Next.js SSR) #############
FROM node:18-alpine AS prod
WORKDIR /app
RUN npm i -g pnpm

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy built application from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
####################################################
