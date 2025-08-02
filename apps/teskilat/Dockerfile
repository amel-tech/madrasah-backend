FROM node:22-alpine

WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy libs directory (shared dependencies)
COPY libs/ ./libs/

# Copy teskilat app files
COPY apps/teskilat/package*.json ./apps/teskilat/
COPY apps/teskilat/tsconfig*.json ./apps/teskilat/

# Install all dependencies (including workspace dependencies)
RUN npm install

# Build the common library first
RUN cd libs/common && npm run build

# Copy teskilat source code
COPY apps/teskilat/src ./apps/teskilat/src

# Build the teskilat application
RUN cd apps/teskilat && npm run build

WORKDIR /app/apps/teskilat

EXPOSE 3002

CMD ["npm", "start"]
