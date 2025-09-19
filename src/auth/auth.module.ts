import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.stratergy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../entities/UserProfiles';
import { UserModule } from '../user/user.module';
import { User } from '../entities/Users';
import { RefreshToken } from '../entities/RefreshTokens';
// import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, User, RefreshToken]),
    forwardRef(() => UserModule),
    UserModule, // Import UserModule to use UserService
    PassportModule,
    JwtModule.registerAsync({ // Register JWT module asynchronously
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') }, //configService.get<string>('JWT_EXPIRATION_TIME')
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // JwtRefreshStrategy,
  ],
})
export class AuthModule { }
