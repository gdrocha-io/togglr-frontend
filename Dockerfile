# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_APP_DOMAIN=""
ARG VITE_API_VERSION=v1

ENV VITE_APP_DOMAIN=${VITE_APP_DOMAIN}
ENV VITE_API_VERSION=${VITE_API_VERSION}
ENV VITE_API_BASE_URL=${VITE_APP_DOMAIN}/api
ENV VITE_API_URL=${VITE_APP_DOMAIN}/api/${VITE_API_VERSION}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create non-root user
RUN addgroup -g 2000 togglr && \
    adduser -u 1000 -G togglr -s /bin/sh -D togglr

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Change ownership
RUN chown -R togglr:togglr /usr/share/nginx/html && \
    chown -R togglr:togglr /var/cache/nginx && \
    chown -R togglr:togglr /var/log/nginx && \
    chown -R togglr:togglr /etc/nginx/conf.d

# Create directories for nginx
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R togglr:togglr /var/cache/nginx

# Switch to non-root user
USER 1000:2000

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]