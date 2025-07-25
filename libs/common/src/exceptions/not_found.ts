import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(errorCode: string, status: HttpStatus = HttpStatus.NOT_FOUND) {
    super({ errorCode }, status);
  }
}