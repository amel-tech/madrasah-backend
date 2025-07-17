FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY apps/teskilat/package*.json ./
COPY tsconfig.base.json /

# Install dependencies
RUN npm install

# Copy source code
COPY apps/teskilat/src ./src
COPY apps/teskilat/tsconfig.json ./

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
