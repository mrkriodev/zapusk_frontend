FROM node:20-alpine AS builder
WORKDIR /app/frontend

COPY package*.json ./

RUN npm install 

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM alpine:3.20 AS deploy

WORKDIR /app/frontend

COPY --from=builder /app/frontend/dist /app/frontend/dist



CMD ["sh", "-c", "rm -rf /deploy/* && cp -r /app/frontend/dist/. /deploy/ && echo 'Frontend deployed to /deploy'"]
