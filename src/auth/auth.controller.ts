import { Body, Controller, Post, ValidationPipe, UsePipes, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth') // Groups endpoints under the "auth" tag in Swagger
@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {

    }
    @Post('register')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @ApiOperation({ summary: 'Register a new user' }) // Describes the endpoint
    @ApiResponse({ status: 201, description: 'User successfully registered and token returned.' })
    @ApiResponse({ status: 409, description: 'Conflict. Username or email already exists.' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this._authService.register(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged in and token returned.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Invalid credentials.' })
    async login(@Body() loginDto: LoginDto) {
        return this._authService.login(loginDto)
    }

}
