export type ErrorResponse = {
  type: string;
  code?: string;
  status: number;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
};