
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',');
const allowedMethods = (process.env.ALLOWED_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE').split(',');

export const corsConfig = {
  origin: allowedOrigins,
  methods: allowedMethods,
};
