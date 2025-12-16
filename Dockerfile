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
