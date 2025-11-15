import { Body, Controller, Post, ValidationPipe, UsePipes, HttpStatus, HttpCode, Res, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth') // Groups endpoints under the "auth" tag in Swagger
@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService, private readonly _configService: ConfigService) {

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
        return await this._authService.registerLocal(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged in and token returned.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Invalid credentials.' })
    async login(@Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: express.Response,
        @Req() req: express.Request) {
        // Validate the user credentials using validateLocal method
        // then call loginLocal to generate tokens and cookies
        // console.log('AuthController - login called');
        // console.log('loginDto', loginDto);
        const identifier = loginDto.username || loginDto.email;
        const user = await this._authService.validateLocal(identifier, loginDto.password);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const data = await this._authService.loginLocal(user, res, req);
        // console.log('login data', data);
        // Let Nest handle JSON serialization Converting circular structure to JSON
        // --> starting at object
        return data;
    }
    @UseGuards(JwtAuthGuard) // Might need to reimplement // Commenting it out for testing
    @Post('logout')
    @ApiOperation({ summary: 'this is used for logout' })
    @ApiResponse({ status: 200, description: 'User Successfully logged out.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Access token is missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden. User does not have the necessary permissions.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async logout(@Req() req, @Res({ passthrough: true }) res: express.Response) {
        await this._authService.logout(req, res);
        return { ok: true };
    }

    // @UseGuards(JwtRefreshGuard)
    @UseGuards(JwtAuthGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh tokens' })
    @ApiResponse({ status: 200, description: 'New access token generated.' })
    async refreshTokens(
        @Req() req,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        // console.log('AuthController - refreshTokens called');
        const sessionId = req.cookies?.['session_id'];
        const refreshToken = req.cookies?.['refresh_token'];
        // console.log('sessionId:', sessionId);
        // console.log('refreshToken:', refreshToken);
        // console.log('req.cookies:', req.cookies);
        // console.log(!sessionId, !refreshToken);
        if (!sessionId || !refreshToken) {
            // console.log('No session or refresh token found');
            throw new UnauthorizedException('No session or refresh token');
        }
        // const user = req.user;
        const result = await this._authService.refresh(req, res);
        // console.log('refresh result', result);
        // Let Nest handle JSON serialization Converting circular structure to JSON
        // --> starting at object
        return result;
    }
    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    @ApiOperation({ summary: 'logout from all active sessions' })
    async logoutAll(@Req() req: any, @Res() res: express.Response) {
        await this._authService.logoutAllSessions(req.user.sub, res);
        return res.json({ ok: true });
    }
}
