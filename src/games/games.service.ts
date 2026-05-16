import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/Games';
import { v4 as uuidv4 } from 'uuid';
import { GamePlayer } from '../entities/GamePlayers';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GamePlayer) private gamePlayersRepository: Repository<GamePlayer>
  ) { }
  async create(createGameDto: CreateGameDto) {
    console.log('Received create game request with data:', createGameDto);
    // check if the user has an ongoing game, if yes then return to that game instead of creating a new one
    const ongoingGamePlayer = await this.gamePlayersRepository.findOne({
      where: {
        userId: createGameDto.userId,
        result: 'unknown' // assuming 'unknown' indicates an ongoing game
      }
    });
    console.log('Ongoing game player found:', ongoingGamePlayer);
    if (ongoingGamePlayer) {
      // Return the existing ongoing game
      console.log('Returning existing ongoing game with ID:', ongoingGamePlayer.gameId);
      return await this.gameRepository.findOne({ where: { id: ongoingGamePlayer.id } });
    }


    const newGame = this.gameRepository.create({
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

    const gameResult = await this.gameRepository.save(newGame);
    if (!gameResult) {
      throw new Error('Failed to create game');
    }

    const game_players = this.gamePlayersRepository.create({
      gameId: gameResult.id,
      userId: createGameDto.userId,
      side: Math.random() < 0.5 ? 'white' : 'black', // randomly assign white or black
      isWinner: false,
      ratingBefore: null,
      ratingAfter: null,
      isBot: false,
      disconnectedAt: null,
      result: 'unknown',
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
