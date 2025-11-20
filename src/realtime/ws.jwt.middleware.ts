// src/realtime/ws-jwt.middleware.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuth {
    private readonly logger = new Logger(WsAuth.name);
    constructor(private readonly jwtService: JwtService) { }

    private parseCookies(cookieHeader?: string): Record<string, string> {
        const out: Record<string, string> = {};
        if (!cookieHeader) return out;
        cookieHeader.split(';').forEach((c) => {
            const idx = c.indexOf('=');
            if (idx === -1) return;
            const key = c.slice(0, idx).trim();
            const val = c.slice(idx + 1).trim();
            out[key] = decodeURIComponent(val);
        });
        return out;
    }

    async authenticateSocket(socket: Socket, next: (err?: any) => void) {
        try {
            let token = (socket.handshake.auth && (socket.handshake.auth as any).token) || null;
            if (!token) {
                const rawCookies = socket.handshake.headers?.cookie as string | undefined;
                const cookies = this.parseCookies(rawCookies);
                token = cookies['access_token'] || cookies['token'] || cookies['session'] || null;
                if (typeof token === 'string' && token.startsWith('Bearer ')) token = token.slice(7);
            }
            if (!token) {
                this.logger.warn('WS auth failed: no token');
                return next(new Error('Authentication error: missing token'));
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub ?? payload.id ?? payload.userId;
            if (!userId) {
                this.logger.warn('WS auth failed: token has no user id', payload);
                return next(new Error('Authentication error: no userId in token'));
            }
            (socket as any).userId = String(userId);
            return next();
        } catch (err: any) {
            this.logger.warn('WS auth verify failed', err?.message ?? err);
            return next(new Error('Authentication failed'));
        }
    }
}
