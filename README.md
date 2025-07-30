# madrasah-backend

Online Medrese Projesinin backend reposudur.

## Tech Stack

- **Nest.js** - Backend framework
- **PostgreSQL** - Database (configured for future use)
- **RabbitMQ** - Message queue (configured for future use)
- **Turborepo** - Monorepo management
- **TypeScript** - Type-safe development
- **Docker & Docker Compose** - Containerization

## Services

### Current Services
- **tedrisat** - Education management service (Port: 3001)
- **teskilat** - Organization management service (Port: 3002)

Each service provides:
- `GET /` - Hello World endpoint
- `GET /health` - Health check endpoint

## Quick Start

### Prerequisites
- Node.js 22+ 
- npm
- Docker & Docker Compose (optional)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build all services:**
   ```bash
   npm run build
   ```

3. **Start all services in development mode:**
   ```bash
   npm run dev
   ```

4. **Start individual service:**
   ```bash
   # Teskilat service
   cd apps/teskilat && npm run dev
   
   # Tedrisat service  
   cd apps/tedrisat && npm run dev
   ```

### Using Docker Compose

1. **Start all services with dependencies:**
   ```bash
   docker-compose up -d
   ```

2. **Stop all services:**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Tedrisat Service (http://localhost:3001)  
- `GET /` - Returns "Hello World from Tedrisat Service!"
- `GET /health` - Health check
- `GET /swagger` - Swagger API documentation
### Teskilat Service (http://localhost:3002)
- `GET /` - Returns "Hello World from Teskilat Service!"
- `GET /health` - Health check
- `GET /swagger` - Swagger API documentation


## API Documentation

Both services include interactive Swagger documentation:

- **Tedrisat Service**: [http://localhost:3001/swagger](http://localhost:3001/swagger)
- **Teskilat Service**: [http://localhost:3002/swagger](http://localhost:3002/swagger)

The Swagger documentation provides:
- Interactive API explorer
- Request/response schemas
- Try-it-out functionality
- Complete endpoint documentation

## Configuration

The project uses a shared configuration system with environment variable validation:

- **Shared Config**: Located in `shared/config/` 
- **Environment Variables**: Centralized in root `.env` file
- **Override Support**: Apps can override configs via `PORT` environment variable
- **Validation**: Uses Joi schema validation for type safety

### Environment Variables

Default values from `.env`:
- `TEDRISAT_PORT=3001` - Tedrisat service port  
- `TESKILAT_PORT=3002` - Teskilat service port
- `DATABASE_URL` - PostgreSQL connection (for future use)
- `RABBITMQ_URL` - RabbitMQ connection (for future use)

## Available Scripts

- `npm run build` - Build all services
- `npm run dev` - Start all services in development mode
- `npm run start` - Start all services in production mode
- `npm run clean` - Clean build artifacts
- `npm run type-check` - Type check all services

## Environment Variables

Copy `.env` file and adjust ports if needed:
- `TEDRISAT_PORT=3001`
- `TESKILAT_PORT=3002`

## Project Structure

```
.
├── apps/                    # Independent services
│   ├── teskilat/           # Organization service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tedrisat/           # Education service
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── libs/                   # Shared libraries
│   └── common/            # Common DTOs and utilities
│       ├── src/dto/
│       ├── package.json
│       └── tsconfig.json
│
├── shared/                 # Shared configuration
│   └── config/            # Environment and configuration management
│
├── .env                   # Environment variables
├── docker-compose.yml     # Docker services configuration
├── turbo.json            # Turborepo configuration
├── package.json          # Root dependencies
└── tsconfig.base.json    # Base TypeScript configuration
```

## Future Enhancements

The project is structured to easily add:
- Database integration with Drizzle ORM
- RabbitMQ message queues
- Shared utilities and types
- Authentication and authorization
- API documentation with Swagger
- Testing setup with Jest
