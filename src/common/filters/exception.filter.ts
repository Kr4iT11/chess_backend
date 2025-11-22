import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request & { requestId?: string }>();
        const res = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorBody: any = {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            details: null
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const excResp = exception.getResponse();
            // common patterns: string, object with message/details, or ValidationPipe result
            if (typeof excResp === 'string') {
                errorBody.message = excResp;
            } else if (typeof excResp === 'object' && excResp !== null) {
                // extract message & possible validation errors
                const maybe: any = excResp;
                errorBody.message = maybe.message || errorBody.message;
                // if ValidationPipe: maybe.message is array or object
                if (maybe.message && Array.isArray(maybe.message)) {
                    errorBody.code = 'INVALID_INPUT';
                    errorBody.details = maybe.message.map((m: any) => {
                        // typical message strings: "field - error"
                        if (typeof m === 'string') return { issue: m };
                        return m;
                    });
                } else if (maybe.message && typeof maybe.message === 'object') {
                    errorBody.details = maybe.message;
                }
                if (maybe.error) errorBody.code = maybe.error;
            }
        } else {
            // non-http exceptions
            errorBody.message = (exception as any)?.message || errorBody.message;
        }

        const requestId = req.requestId || res.getHeader('X-Request-Id') || null;

        // Log full exception with requestId
        this.logger.error({
            message: (exception as any)?.message,
            stack: (exception as any)?.stack,
            requestId,
            path: req.url
        });

        res.status(status).json({
            meta: {
                requestId,
                status: 'error',
                httpStatus: status,
                timestamp: new Date().toISOString(),
                path: req.url
            },
            data: null,
            error: {
                code: errorBody.code,
                message: errorBody.message,
                details: errorBody.details || null,
                traceId: requestId
            }
        });
    }
}
