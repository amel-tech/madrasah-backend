import { defineConfig } from 'drizzle-kit';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  schema: './src/database/schema/*',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'tedrisat',
    password: process.env.DB_PASSWORD || 'tedrisat',
    database: process.env.DB_NAME || 'tedrisat_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
});
