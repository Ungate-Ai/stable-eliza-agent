FROM node:23.3.0-slim

RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY agent ./agent
COPY packages ./packages
COPY scripts ./scripts
COPY characters ./characters
RUN pnpm install
RUN pnpm build-docker
CMD ["pnpm", "start", "--non-interactive"]