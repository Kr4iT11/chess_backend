import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('social') // Groups endpoints under the "social" tag in Swagger
@Controller('social')
@ApiBearerAuth('JWT-auth')
export class SocialController {
  constructor(private readonly socialService: SocialService) { }
  // @UseGuards(JwtAuthGuard)
  @Post('request')
  async create(@Body() createSocialDto: CreateSocialDto) {
    console.log('called', createSocialDto);
    return await this.socialService.create(createSocialDto);
  }
}
