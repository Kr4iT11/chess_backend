import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/Users';
import { UserModule } from './user/user.module';
import { UserProfile } from './entities/UserProfiles';
import { RefreshToken } from './entities/RefreshTokens';
import { AuditLog } from './entities/AuditLogs';
import { AuthProvider } from './entities/AuthProviders';
import { Friend } from './entities/Friends';
import { EloRatingHistory } from './entities/EloRatingHistory';
import { FileUpload } from './entities/FileUploads';
import { FriendNotification } from './entities/FriendNotifications';
import { FriendRequest } from './entities/FriendRequests';
import { Friendship } from './entities/Friendships';
import { GamePlayer } from './entities/GamePlayers';
import { Game } from './entities/Games';
import { Leaderboard } from './entities/Leaderboards';
import { Message } from './entities/Messages';
import { Notification } from './entities/Notifications';
import { Permission } from './entities/Permissions';
import { Role } from './entities/Roles';
import { TournamentPlayer } from './entities/TournamentPlayers';
import { Tournament } from './entities/Tournaments';
import { UserAchievement } from './entities/UserAchievements';
import { Move } from './entities/Moves';
import { Achievement } from './entities/Achievements';
import { Avatar } from './entities/Avatars';
import { Block } from './entities/Blocks';
import { UserRole } from './entities/UserRoles';
import { SocialModule } from './social/social.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })
    , TypeOrmModule.forRoot({
      // For now hardcoded values are added this has to be solved
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, UserProfile, RefreshToken, AuditLog, AuthProvider,
        Achievement, Avatar, Block, Friend, EloRatingHistory, FileUpload,
        FriendNotification, FriendRequest, Friendship, GamePlayer, Game, Leaderboard, Message, Move, Notification, Permission, Role, TournamentPlayer, Tournament,
        UserAchievement, UserRole
      ], // Add all your entities here
      // synchronize: true, // In development, this syncs your entities with the DB. Disable in production.
    }), AuthModule, UserModule, SocialModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
