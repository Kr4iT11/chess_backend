import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/Games';
import { v4 as uuidv4 } from 'uuid';
import { GamePlayer } from '../entities/GamePlayers';
import { DataSource } from 'typeorm';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GamePlayer) private gamePlayersRepository: Repository<GamePlayer>
    , private dataSource: DataSource,
  ) { }
  async create(createGameDto: CreateGameDto) {
    return await this.dataSource.transaction(async manager => {
      // check if user already has an ongoing game
      const existingPlayer = await manager
        .getRepository(GamePlayer)
        .createQueryBuilder('gp')
        .setLock('pessimistic_write')
        .where('gp.userId = :userId', {
          userId: createGameDto.userId,
        })
        .andWhere('gp.result = :result', {
          result: 'unknown',
        })
        .getOne();
      // if on going game, return it;
      if (existingPlayer) {
        return await manager.getRepository(Game).findOne({
          where: {
            id: existingPlayer.gameId,
          },
        });
      }

      // save game
      const game = manager.getRepository(Game).create({
        uuid: uuidv4(),
        variant: createGameDto.variant,
        timeControl: createGameDto.timeControl,
        status: createGameDto.status,
        result: createGameDto.result,
        movesCount: createGameDto.moves_count ?? 0,
        currentFen: createGameDto.current_fen,
        createdAt: new Date(),
        visibility: createGameDto.visiblity,
        startedAt: null,
        finishedAt: null,
        terminationReason: null,
      });
      const savedGame = await manager.getRepository(Game).save(game);

      // save game player
      const gamePlayer = manager.getRepository(GamePlayer).create({
        gameId: savedGame.id,
        userId: createGameDto.userId,
        side: Math.random() < 0.5 ? 'white' : 'black', // randomly assign white or black
        isWinner: false,
        ratingBefore: null,
        ratingAfter: null,
        isBot: false,
        disconnectedAt: null,
        result: 'unknown',
      });
      await manager.getRepository(GamePlayer).save(gamePlayer);
      return savedGame;
    });
  }

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
