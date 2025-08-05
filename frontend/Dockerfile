FROM node:24.4.1-alpine AS builder

WORKDIR /app

COPY package*.json ./


COPY src ./src
COPY public ./public
COPY tsconfig*.json ./
COPY vite.config.ts ./

RUN npm i

CMD [ "npm", "run", "build" ]
