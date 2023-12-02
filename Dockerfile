FROM node:20-slim AS base

WORKDIR /usr/src/app

# Copy root package.json and lockfile
COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./libs ./libs
COPY /apps/game-server ./apps/game-server
RUN yarn

EXPOSE 8080

CMD ["yarn", "run", "hathora:start"]