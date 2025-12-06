FROM node:20-alpine

# Add CA certificates to enable TLS connections (needed for cloud MongoDB)
RUN apk add --no-cache ca-certificates

# Workdir for the full repository
WORKDIR /app

# Copy backend package files and install dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy the whole repository so `shared` and other folders are available
COPY . .

# Run from inside backend folder
WORKDIR /app/backend

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
