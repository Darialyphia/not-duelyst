FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./libs ./libs
COPY /apps/game-server ./apps/game-server

WORKDIR /app/server

RUN yarn install
RUN yarn workspace @hc/game-server run build

FROM node:20-alpine

WORKDIR /app/server

COPY --from=build /app/apps/game-server/package*.json .

RUN yarn install --production --frozen-lockfile

COPY --from=build /app/apps/game-server/dist dist

EXPOSE 8080
CMD ["yarn", "run", "hathora:start"]
