import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/Users';
import { UserProfile } from '../entities/UserProfiles';
import { Game } from '../entities/Games';
import { Move } from '../entities/Moves';
import { GamePlayer } from '../entities/GamePlayers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Game, Move, GamePlayer]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule { }
                        