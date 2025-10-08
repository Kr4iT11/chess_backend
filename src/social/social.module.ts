import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/Users';
import { UserProfile } from '../entities/UserProfiles';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { Block } from '../entities/Blocks';
import { Friendship } from '../entities/Friendships';
import { FriendRequest } from '../entities/FriendRequests';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Block, Friendship,FriendRequest]), RealtimeModule
  ],
  controllers: [SocialController],
  providers: [SocialService, UserService],
})
export class SocialModule { }
