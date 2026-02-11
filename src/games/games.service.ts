import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/Games';
import { v4 as uuidv4 } from 'uuid';
import { GamePlayer } from '../entities/GamePlayers';
import { disconnect } from 'process';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GamePlayer) private gamePlayersRepository: Repository<GamePlayer>
  ) { }
  async create(createGameDto: CreateGameDto) {
    const newGame = this.gameRepository.create({
      uuid: uuidv4(),
      variant: 'standard', // for phase 1 only keep 'standard'
      timeControl: 'unlimited', // for phase 1 only keep 'unlimited'
      status: 'created', // default value when a game is created
      result: 'ongoing', // default value when a game is created
      movesCount: 0,
      currentFen: createGameDto.current_fen,
      createdAt: new Date(),
      visibility: 'public', // default value when a game is created
      startedAt: null,
      finishedAt: null,
      terminationReason: null,
    });

    const gameResult = await this.gameRepository.save(newGame);
    if (!gameResult) {
      throw new Error('Failed to create game');
    }

    const game_players = this.gamePlayersRepository.create({
      userId: createGameDto.userId,
      gameId: gameResult.id,
      side: 'white', // for now lets keep it to white, in the future we can add a logic to assign colors
      isWinner: false, // default value, will be updated at the end of the game
      ratingBefore: null, // we can fetch the user's rating before the game starts and update it after the game ends
      ratingAfter: null, // we can calculate the user's rating after the game ends and update it
      isBot: false, // for now we are not supporting bots, but we can add a logic to assign bots in the future
      disconnectedAt: null, // we can update this field when a player disconnects from the game
      result: 'unknown', // default value, will be updated at the end of the game
    })
    await this.gamePlayersRepository.save(game_players);
    return gameResult
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
