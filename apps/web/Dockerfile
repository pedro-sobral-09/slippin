FROM node:24

WORKDIR /app

RUN corepack enable

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . . 

WORKDIR /app/apps/web

ENV PORT=5173

RUN pnpm build

EXPOSE 5173

CMD ["pnpm", "start"]