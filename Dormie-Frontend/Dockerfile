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
CMD ["pnpm", "run", "dev"]  # Vite / Next.js dev server


###############################################################################
# 2️⃣  BUILD – compiles static site
###############################################################################
FROM node:18-alpine AS build
WORKDIR /app

# Install pnpm in this stage (needed for the build)
RUN npm install -g pnpm       # <── fixed: makes pnpm available here

# Re-use the node_modules from development stage
COPY --from=development /app/node_modules ./node_modules
COPY . .

# Optional API base baked into JS
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build static assets
RUN pnpm run build            # Vite → /app/dist   (Next export → /app/out)


###############################################################################
# 3️⃣  PRODUCTION – tiny Nginx image serving the build
###############################################################################
FROM nginx:stable-alpine AS prod

# Nginx config lives in Dormie-Frontend/nginx/prod.conf
COPY ./nginx/prod.conf /etc/nginx/conf.d/default.conf

# Copy only the built static files
#  ↳ Vite output: /app/dist    (adjust if you use Next export → /app/out)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
###############################################################################
