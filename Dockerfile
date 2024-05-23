FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./packages/api ./packages/api
COPY ./packages/sdk ./packages/sdk
COPY ./packages/shared ./packages/shared
COPY ./packages/server ./packages/server

RUN yarn install
RUN yarn workspace @game/game-server run build

FROM node:20-alpine

WORKDIR /app/packages/server

# COPY ./configs ./configs
# COPY ./packages/api ./packages/api
# COPY ./packages/sdk ./packages/sdk
# COPY ./packages/shared ./packages/shared
# COPY /apps/game-server ./apps/game-server

# RUN yarn install --production --frozen-lockfile

COPY --from=build /app/packages/server/dist dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
