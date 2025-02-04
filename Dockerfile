FROM rust:1.84-slim AS pulse-builder

RUN apt-get update && \
    apt-get install -y git make && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/marlinprotocol/oyster-monorepo.git -b roshan/pulse
WORKDIR /app/oyster-monorepo/initialization/pulse
RUN cargo build --release



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
COPY packages/plugin-image-generation ./packages/plugin-image-generation
COPY ./start.sh ./start.sh
RUN chmod +x ./start.sh

COPY scripts ./scripts
COPY characters ./characters
COPY --from=pulse-builder /app/oyster-monorepo/initialization/pulse/target/release/pulse-server ./
RUN chmod +x ./pulse-server

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
RUN pnpm install
RUN pnpm run build-docker


