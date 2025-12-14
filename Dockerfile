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
