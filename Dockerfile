FROM node:20-slim AS base

WORKDIR /usr/src/app

# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./

# Copy the docs package.json
COPY apps/game-server/package.json ./apps/game-server/package.json

RUN npm install

# Copy app source
COPY . .

EXPOSE 8080

CMD ["yarn", "run", "hathora:start"]