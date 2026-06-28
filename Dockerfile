FROM node:20-alpine AS builder
WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html/zapusk.io

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
