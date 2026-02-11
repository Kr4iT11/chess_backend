import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('games') // Groups endpoints under the "games" tag in Swagger
@ApiBearerAuth('JWT-auth')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Post('create')
  async create(@Request() req, @Body() createGameDto: CreateGameDto) {
    createGameDto.userId = req.user.id.toString();
    return this.gamesService.create(createGameDto);
  }
}
