import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })
    , TypeOrmModule.forRoot({
      // For now hardcoded values are added this has to be solved
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database:  process.env.DB_DATABASE,
      entities: [User], // Add all your entities here
      // synchronize: true, // In development, this syncs your entities with the DB. Disable in production.
    }), AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
