import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/Users';
import { UserProfile } from '../entities/UserProfiles';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
