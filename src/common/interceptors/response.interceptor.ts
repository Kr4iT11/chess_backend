import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const http = ctx.switchToHttp();
        const req = http.getRequest<Request & { requestId?: string }>();
        console.warn('Request ID in Interceptor:', req.requestId);
        const res = http.getResponse();
        console.warn('Response Status in Interceptor:', res.statusCode);

        return next.handle().pipe(
            map((data) => {
                // HTTP status after handlers (default 200)
                const status = res.statusCode || 200;
                return {
                    meta: {
                        requestId: req.requestId || res.getHeader('X-Request-Id') || null,
                        status: status >= 400 ? 'error' : 'success',
                        httpStatus: status,
                        timestamp: new Date().toISOString(),
                        path: req.url
                    },
                    data: status >= 400 ? null : data,
                    error: status >= 400 ? data : null
                };
            })
        );
    }
}
