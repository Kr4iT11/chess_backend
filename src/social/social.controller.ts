import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req } from '@nestjs/common';
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

  @Get('incoming')
  async incomingRequests(@Request() req){
    const data = await this.socialService.getIncomingRequests(req.user.id.toString());
    return data;
  }

  @Get('outgoing')
  async outgoingRequests(@Request() req){
    const data = await this.socialService.getOutgoingRequests(req.user.id.toString());
    return data;
  }
  @Post('request')
  async create(@Body() createSocialDto: CreateSocialDto) {
    console.log('called', createSocialDto);
    return await this.socialService.create(createSocialDto);
  }
  @Post(':id/cancel')
  async cancelRequest(@Request() req, @Param('id') id: string) {
    console.log(req.user.id);
    await this.socialService.cancelRequest(req.user.id.toString(), id);
    return `Friend request with ID ${id} has been canceled`;
  }
  @Post(':id/accept')
  async acceptRequest(@Request() req, @Param('id') id: string) {
    await this.socialService.acceptRequest(req.user.id.toString(), id);
    return `Friend request with ID ${id} has been accepted`;
  }
  @Post(':id/decline')
  async declineRequest(@Request() req, @Param('id') id: string) {
    await this.socialService.acceptRequest(req.user.id.toString(), id);
    return `Friend request with ID ${id} has been declined`;
  }
}


