FROM node:20-alpine3.17 AS development

WORKDIR /usr/src/app

RUN npm install -g pnpm
RUN npm install -g prisma

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

COPY apps/notifications apps/notifications
COPY libs libs
COPY prisma prisma

RUN pnpm install -r
RUN npx prisma generate

RUN pnpm run build notifications

FROM node:20-alpine3.17 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY prisma prisma
COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod

RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/notifications/main"]