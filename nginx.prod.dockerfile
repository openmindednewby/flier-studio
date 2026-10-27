FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /etc/nginx/conf.d
COPY nginx.conf default.conf
WORKDIR /app
COPY --from=build /src/dist/ .
