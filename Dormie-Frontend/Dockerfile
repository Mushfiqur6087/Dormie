# ───────── Development stage ─────────
FROM node:18-alpine AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose the development port
EXPOSE 3000

# Start the development server
CMD ["pnpm", "run", "dev"]
