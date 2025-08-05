import { ErrorCode } from '../types';

export const CommonErrors: Record<string, ErrorCode> = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    status: 400,
  },
  CONFLICT: {
    code: 'CONFLICT',
    status: 409,
  },
} as const;
