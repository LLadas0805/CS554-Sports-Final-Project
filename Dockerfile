<<<<<<< HEAD
# --------------------
# 1. Build frontend
# --------------------
FROM node:20 AS frontend
WORKDIR /app/frontend

# Copy package.json and install deps
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend files and build
COPY frontend/ ./
RUN npm run build

# --------------------
# 2. Build backend
# --------------------
FROM node:20
WORKDIR /app/backend

# Copy package.json and install deps
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy frontend build into backend's dist folder
COPY --from=frontend /app/frontend/dist ./dist

# Environment
ENV NODE_ENV=production
EXPOSE 3000

# Start backend server
CMD ["npm", "start"]
=======
### Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy only frontend package.json first to leverage layer caching for deps
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

# Copy the whole repository so frontend can import shared files at ../shared
COPY . .

WORKDIR /app/frontend
RUN npm run build

### Production image
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
