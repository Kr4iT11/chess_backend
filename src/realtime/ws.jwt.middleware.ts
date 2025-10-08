import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketJwtMiddleware {
    /**
     *
     */
    constructor(private readonly jwtService: JwtService) {

    }

    async authenticateSocket(socket: Socket, next: (err?: Error) => void): Promise<any> {
        try {
            const token = this.extractToken(socket);
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const payload = this.jwtService.verify(token);
            (socket as any).userId = payload.sub ?? payload.id ?? payload.userId;
            return next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            return next(new Error('Authentication failed'));
        }
    }

    private extractToken(socket: Socket): string | null {
        let token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            token = socket.handshake.headers?.authorization;
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trim();
            }
        }
        return token || null;
    }
}