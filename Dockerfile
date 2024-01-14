FROM node:20-slim AS base

WORKDIR /usr/src/app

# Copy root package.json and lockfile
COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./libs ./libs
COPY /apps/game-server ./apps/game-server
RUN npm install

EXPOSE 8080

CMD ["npm", "run", "hathora:start"]