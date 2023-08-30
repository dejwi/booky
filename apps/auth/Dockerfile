FROM node:18-alpine3.16 AS development

WORKDIR /usr/src/app

RUN npm install -g pnpm
RUN npm install -g prisma

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

COPY apps/auth apps/auth
COPY libs libs
COPY prisma prisma

RUN pnpm install -r
RUN npx prisma generate

RUN pnpm run build auth

FROM node:18-alpine3.16 AS production

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

CMD ["node", "dist/apps/auth/main"]