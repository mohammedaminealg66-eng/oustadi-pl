import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      success: false,
      statusCode: status,
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exception.message,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(`${ctx.getRequest().method} ${ctx.getRequest().url} - ${status} - ${errorBody.message}`);
    }

    response.status(status).json(errorBody);
  }
}
