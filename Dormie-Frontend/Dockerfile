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


################ 2. build (Next.js) ################
FROM node:18-alpine AS build
WORKDIR /app
RUN npm i -g pnpm
COPY --from=development /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# 1) compile
RUN pnpm run build

# 2) export to static HTML
RUN pnpm exec next export          
####################################################

################ 3. prod (Nginx) ###################
FROM nginx:stable-alpine AS prod
COPY ./nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html  
EXPOSE 80 443
CMD ["nginx","-g","daemon off;"]
####################################################
