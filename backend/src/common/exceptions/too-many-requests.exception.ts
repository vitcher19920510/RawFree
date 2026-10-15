import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Превышен лимит запросов') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
