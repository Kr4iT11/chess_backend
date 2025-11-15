import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { WsAuth } from './ws.jwt.middleware';

@WebSocketGateway({
  cors: { origin: '*' },    // dev: allow all origins; restrict in prod
  path: '/socket.io',
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets = new Map<string, Set<string>>();
  constructor(private readonly realtimeService: RealtimeService, private readonly configService: ConfigService, private readonly wsAuth: WsAuth) {
    this.realtimeService.setGateway(this);
  }
  afterInit(server: Server) {
    // register auth middleware BEFORE any connection is accepted
    server.use((socket: any, next: any) => {
      this.wsAuth.authenticateSocket(socket, next);
    });
  }
  async handleConnection(socket: Socket) {
    try {
      console.log('[Gateway] handleConnection socketId=', socket.id);
      console.log('[Gateway] handshake.auth=', socket.handshake.auth);
      console.log('[Gateway] handshake.query=', socket.handshake.query);
      console.log('[Gateway] handshake.headers.cookie=', socket.handshake.headers?.cookie);
      console.log('Socket connected:', socket.id);
      const userId = (socket as any).userId;
      if (!userId) {
        console.log('Socket connection rejected: no userId');
        socket.disconnect(true);
        return;
      }
      const set = this.userSockets.get(userId) ?? new Set<string>();
      set.add(socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      this.userSockets.set(userId, set);
      console.log(`[Gateway] socket connected: socketId=${socket.id} userId=${userId}`);
      socket.join(this.userRoom(userId));
      await this.realtimeService.deliverPendingNotifications(userId);
    } catch (error) {
      console.log('Socket connection error:', error);
      socket.disconnect(true);
    }
  }
  handleDisconnect(socket: Socket) {
    const userId = (socket as any).userId;
    const set = this.userSockets.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    if (userId) {
      const room = `user:${userId}`;
      socket.leave(room);
    }
  }

  userRoom(userId: string) {
    return `user:${userId}`;
  }

  emitToUser(userId: string, event: string, payload: any) {
    console.log(`[Gateway] emitting to user ${userId} event ${event} payload:`, payload);
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }
  async listSocketsInRoom(userId: string) {
    const sockets = await this.server.in(`user:${userId}`).allSockets(); // returns Set of socketIds
    console.log('sockets in room', `user:${userId}`, sockets);
    console.log('array: ', Array.from(sockets));
    return Array.from(sockets);
  }

}

