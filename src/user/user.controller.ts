// An example controller with a protected route
// src/user/user.controller.ts
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'; // Import ApiBearerAuth
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user data.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiBearerAuth('JWT-auth') // This links to the security scheme we defined in main.ts
  getProfile(@Request() req) {
    return req.user;
  }
}