# Build frontend
FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Build backend
FROM node:20
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

# Copy frontend build into backend
COPY --from=frontend /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
