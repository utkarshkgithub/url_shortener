FROM node:26-bookworm-slim

WORKDIR /app

COPY package-lock.json package.json tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

CMD ["node","dist/index.js"]