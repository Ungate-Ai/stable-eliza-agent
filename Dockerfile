FROM node:23.3.0-slim

RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
COPY agent ./agent
COPY packages/adapter-sqlite ./packages/adapter-sqlite
COPY packages/client-twitter ./packages/client-twitter
COPY packages/core ./packages/core
COPY packages/client-direct ./packages/client-direct
COPY packages/plugin-node ./packages/plugin-node

COPY scripts ./scripts
COPY characters ./characters

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
RUN pnpm install
RUN pnpm run build-docker

