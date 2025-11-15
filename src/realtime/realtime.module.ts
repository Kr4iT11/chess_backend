import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendNotification } from '../entities/FriendNotifications';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RealtimeController } from './realtime.controller';
import { WsAuth } from './ws.jwt.middleware'

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendNotification]),
    ConfigModule,
    JwtModule.registerAsync({ // Register JWT module asynchronously
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') }, //configService.get<string>('JWT_EXPIRATION_TIME')
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RealtimeController],
  providers: [RealtimeGateway, RealtimeService, WsAuth],
  exports: [RealtimeService, RealtimeGateway,WsAuth],
})
export class RealtimeModule { }
