FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY apps/tedrisat/package*.json ./
COPY tsconfig.base.json /

# Install dependencies
RUN npm install

# Copy source code
COPY apps/tedrisat/src ./src
COPY apps/tedrisat/tsconfig.json ./

# Build the application
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
