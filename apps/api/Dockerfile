FROM node:24

WORKDIR /app

RUN corepack enable

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

COPY . . 

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

