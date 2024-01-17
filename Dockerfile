FROM node:20-slim AS base

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./libs ./libs
COPY /apps/game-server ./apps/game-server

RUN yarn install

RUN yarn workspace @hc/game-server run build

EXPOSE 8080
CMD ["yarn", "run", "hathora:start"]