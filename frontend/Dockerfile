FROM node:24.4.1-alpine AS builder

WORKDIR /app

COPY package*.json ./


COPY src ./src
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

RUN npm i

CMD [ "npm", "run", "build" ]
