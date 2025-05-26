FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/src/templates ./dist/templates

USER node

CMD ["node", "dist/main"]

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=production /usr/src/app/package*.json ./
COPY --from=production /usr/src/app/dist ./dist
COPY --from=production /usr/src/app/node_modules ./node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3005/health/ping || exit 1

ENV NODE_ENV=production
ENV PORT=3005

EXPOSE 3005

USER node

CMD ["node", "dist/main.js"] 