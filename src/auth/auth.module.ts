import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
    UserModule, // Import UserModule to use UserService
    PassportModule,
    JwtModule.registerAsync({ // Register JWT module asynchronously
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: '1234567890abcdef', // configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600' }, //configService.get<string>('JWT_EXPIRATION_TIME')
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
