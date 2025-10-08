import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendNotification } from '../entities/FriendNotifications';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RealtimeController } from './realtime.controller';

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
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule { }
