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



###############################################################################
# 2️⃣  BUILD  – compiles the static site
###############################################################################
FROM node:18-alpine AS build
WORKDIR /app

# Re-use deps from the dev stage (fast!)
COPY --from=development /app/node_modules ./node_modules
COPY . .

# Allow API base to be baked in at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build          # Vite → /app/dist   (or Next.js → /.next or /out)
###############################################################################

###############################################################################
# 3️⃣  PRODUCTION  – tiny Nginx image that serves the build
###############################################################################
FROM nginx:stable-alpine AS prod
# Nginx config lives in repo root at:  nginx/prod.conf
COPY ./nginx/prod.conf /etc/nginx/conf.d/default.conf

# Copy only the prepared static files
#  - Vite:    /app/dist
#  - Next.js: /app/out   (adjust path if you use `next export`)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
###############################################################################