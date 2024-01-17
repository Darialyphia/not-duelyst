# FROM node:20 as builder

# WORKDIR /usr/src/app

# USER node
# COPY --chown=node:node package.json package-lock.json* ./

# COPY --chown=node:node package.json yarn.lock ./
# COPY --chown=node:node ./configs ./configs
# COPY --chown=node:node ./libs ./libs
# COPY --chown=node:node ./apps/game-server ./apps/game-server

# RUN yarn install --frozen-lockfile

# COPY --chown=node:node . .
# COPY . .

# RUN yarn build --filter=game-server

# FROM node:20-slim

# ENV NODE_ENV production
# USER node

# WORKDIR /usr/src/app

# COPY --chown=node:node package.json yarn.lock ./
# COPY --chown=node:node ./configs ./configs
# COPY --chown=node:node ./libs ./libs
# COPY --chown=node:node ./apps/game-server ./apps/game-server

# RUN yarn install --production --frozen-lockfile

# COPY --from=builder /usr/src/app/apps/game-server/dist ./dist

# EXPOSE 8080
# CMD [ "node", "dist/index.js" ]


FROM node:20-slim AS base

WORKDIR /usr/src/app

# Copy root package.json and lockfile
COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./libs ./libs
COPY /apps/game-server ./apps/game-server
RUN yarn install
RUN yarn workspace @hc/game-server run start

EXPOSE 8080

CMD ["yarn", "run", "hathora:start"]