import { Body, Controller, Post, ValidationPipe, UsePipes, HttpStatus, HttpCode, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh.guard';
import { JwtPayload } from 'src/types/jwt-payload.type';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@ApiTags('auth') // Groups endpoints under the "auth" tag in Swagger
@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService, private readonly _configService: ConfigService) {

    }
    private setRefreshTokenCookie(res: express.Response, token: string) {
        res.cookie('refresh_token', token, {
            // "start:dev": "nest start --watch","start:prod": "node dist/main",
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            path: '/',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
    }
    @Post('register')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @ApiOperation({ summary: 'Register a new user' }) // Describes the endpoint
    @ApiResponse({ status: 201, description: 'User successfully registered and token returned.' })
    @ApiResponse({ status: 409, description: 'Conflict. Username or email already exists.' })
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const data = await this._authService.register(createUserDto);
        this.setRefreshTokenCookie(res, data.refreshToken);
        return { accessToken: data.accessToken, user: data.user };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged in and token returned.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Invalid credentials.' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        const data = await this._authService.login(loginDto);
        this.setRefreshTokenCookie(res, data.refreshToken);
        return { accessToken: data.accessToken, user: data.user };
    }
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @ApiOperation({ summary: 'this is used for logout' })
    @ApiResponse({ status: 200, description: 'User Successfully logged out.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Access token is missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden. User does not have the necessary permissions.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async logout(@Req() req, @Res({ passthrough: true }) res: express.Response) {
        console.log('testing', req.user.id)
        this._authService.logout(req.user.sub)
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            path: '/'
        });
        return { message: 'Logged out' };
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh tokens' })
    @ApiResponse({ status: 200, description: 'New access token generated.' })
    async refreshTokens(
        @Req() req,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const user = req.user;
        return this._authService.refreshTokens(user.id, req.body.refreshToken);

    }
}
