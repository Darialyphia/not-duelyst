FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY ./configs ./configs
COPY ./packages/api ./packages/api
COPY ./packages/sdk ./packages/sdk
COPY ./packages/shared ./packages/shared
COPY ./packages/server ./packages/server

RUN npm install
RUN npm --workspace=@game/game-server run build

FROM node:20-alpine

WORKDIR /app/packages/server

COPY --from=build /app/packages/server/dist dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
