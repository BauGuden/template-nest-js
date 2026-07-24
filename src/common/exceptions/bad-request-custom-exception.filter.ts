import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { throwError } from 'rxjs';
import { ErrorDto } from '../dtos/error.dto';

interface BadRequestResponse {
  message?: string | string[];
  statusCode?: number;
}

@Catch(BadRequestException)
export class BadRequestCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BadRequestCustomExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = exception.getResponse();
    const details: BadRequestResponse =
      typeof response === 'string' ? { message: response } : response;
    const error: ErrorDto = {
      message: details.message ?? exception.message,
      statusCode: details.statusCode ?? exception.getStatus(),
      data: host.switchToRpc().getData<unknown>(),
      timestamp: new Date().toISOString(),
    };

    this.logger.error(JSON.stringify(error));
    return throwError(() => error);
  }
}
