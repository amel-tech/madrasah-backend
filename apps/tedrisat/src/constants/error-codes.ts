import { ErrorCode } from '@madrasah/common';

export const TedrisatErrors: Record<string, ErrorCode> = {
  STUDENT_NOT_FOUND: {
    code: 'STUDENT_NOT_FOUND',
    status: 404,
  },
  STUDENT_ALREADY_ENROLLED: {
    code: 'STUDENT_ALREADY_ENROLLED',
    status: 409,
  },
  CLASS_FULL: {
    code: 'CLASS_FULL',
    status: 409,
  },
  EXAMPLE_NOT_FOUND: {
    code: 'EXAMPLE_NOT_FOUND',
    status: 404,
  },
} as const;
