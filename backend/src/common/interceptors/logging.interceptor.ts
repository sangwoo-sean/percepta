import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { maskSensitiveData } from '../utils/sensitive-data.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const reqId = uuidv4().slice(0, 8);
    const startTime = Date.now();
    const { method, url, query, params, body } = request;

    // Build request log data
    const reqLogData: Record<string, unknown> = {
      type: 'REQ',
      reqId,
      method,
      url,
    };

    // Add query/params for GET requests
    if (method === 'GET') {
      if (Object.keys(query).length > 0) {
        reqLogData.query = query;
      }
      if (Object.keys(params).length > 0) {
        reqLogData.params = params;
      }
    }

    // Add body for POST/PUT/PATCH requests (with sensitive data masked)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      reqLogData.body = maskSensitiveData(body);
    }

    this.logger.info(reqLogData, `[REQ] ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          const resLogData = {
            type: 'RES',
            reqId,
            method,
            url,
            statusCode,
            responseTime,
          };

          this.logger.info(resLogData, `[RES] ${method} ${url} ${statusCode} ${responseTime}ms`);
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          const resLogData = {
            type: 'RES',
            reqId,
            method,
            url,
            statusCode,
            responseTime,
            error: {
              name: error.name,
              message: error.message,
            },
          };

          this.logger.error(resLogData, `[RES] ${method} ${url} ${statusCode} ${responseTime}ms`);
        },
      }),
    );
  }
}
