import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let errorName: string;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string | string[]) || exception.message;
        errorName = (responseObj.error as string) || exception.name;
      } else {
        message = exception.message;
        errorName = exception.name;
      }
      stack = exception.stack;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorName = exception.name || 'InternalServerError';
      stack = exception.stack;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorName = 'InternalServerError';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log based on status code
    const logData = {
      type: 'ERROR',
      method: request.method,
      url: request.url,
      statusCode: status,
      error: {
        name: errorName,
        message,
        ...(status >= 500 && stack ? { stack } : {}),
      },
    };

    if (status >= 500) {
      this.logger.error(logData, `[ERROR] ${request.method} ${request.url}`);
    } else {
      this.logger.warn(logData, `[ERROR] ${request.method} ${request.url}`);
    }

    response.status(status).json(errorResponse);
  }
}
