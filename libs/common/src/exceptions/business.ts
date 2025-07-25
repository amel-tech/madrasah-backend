import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(errorCode: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ errorCode }, status);
  }
}