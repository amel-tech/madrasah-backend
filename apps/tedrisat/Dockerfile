FROM node:22-alpine

WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy libs directory (shared dependencies)
COPY libs/ ./libs/

# Copy tedrisat app files
COPY apps/tedrisat/package*.json ./apps/tedrisat/
COPY apps/tedrisat/tsconfig*.json ./apps/tedrisat/

# Install all dependencies (including workspace dependencies)
RUN npm install

# Build the common library first
RUN cd libs/common && npm run build

# Copy tedrisat source code
COPY apps/tedrisat/src ./apps/tedrisat/src

# Build the tedrisat application
RUN cd apps/tedrisat && npm run build

WORKDIR /app/apps/tedrisat

EXPOSE 3002

CMD ["npm", "start"]
