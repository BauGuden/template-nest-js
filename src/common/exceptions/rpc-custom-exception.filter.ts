import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { ErrorDto } from '../dtos/error.dto';

interface RpcError {
  code?: number;
  message?: string | string[];
}

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcCustomExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const cause = exception.getError();
    const details: RpcError =
      typeof cause === 'string' ? { message: cause } : cause;
    const error: ErrorDto = {
      message: details.message ?? exception.message,
      statusCode: details.code ?? 500,
      data: host.switchToRpc().getData<unknown>(),
      timestamp: new Date().toISOString(),
    };

    this.logger.error(JSON.stringify(error));
    return throwError(() => error);
  }
}
