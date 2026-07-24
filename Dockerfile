# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./

FROM base AS development
ENV NODE_ENV=development
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
USER node
CMD ["yarn", "start:dev"]

FROM base AS build
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM base AS production-dependencies
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production=true \
    && yarn cache clean

FROM node:${NODE_VERSION}-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
CMD ["node", "dist/main.js"]
