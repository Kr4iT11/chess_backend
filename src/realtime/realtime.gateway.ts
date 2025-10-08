import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*' },    // dev: allow all origins; restrict in prod
  path: '/socket.io',
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets = new Map<string, Set<string>>();
  constructor(private readonly realtimeService: RealtimeService, private readonly configService: ConfigService) {
    this.realtimeService.setGateway(this);
  }
  afterInit(server: any) {
    // console.log(server);
    console.log('Socket gateway initalized');
  }
  async handleConnection(socket: Socket) {
    try {
      console.log('Socket connected:', socket.id);
      const userId = (socket as any).userId;
      if (!userId) {
        socket.disconnect(true);
        return;
      }
      const set = this.userSockets.get(userId) ?? new Set<string>();
      set.add(socket.id);
      this.userSockets.set(userId, set);
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
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

}

