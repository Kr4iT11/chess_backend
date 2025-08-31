import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Generates Access and Refresh tokens for a user.
     */
    private async getTokens(user: User) {
        const payload = { username: user.username, sub: user.id };

        const [accessToken, refreshToken] = await Promise.all([
            // Access Token
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
            }),
            // Refresh Token
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    /**
     * Hashes and saves the refresh token to the user's record in the database.
     */
    private async updateRefreshToken(userId: number, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.setRefreshToken(userId, hashedRefreshToken);
    }

    async register(createUserDto: CreateUserDto) {
        // Logic to check for existing user and hash password
        const existingUser = await this.userService.findByEmail(createUserDto.email);
        if (existingUser) throw new UnauthorizedException('Email already exists');

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = await this.userService.createUser(createUserDto, hashedPassword);

        // After creating the user, generate tokens and log them in
        const tokens = await this.getTokens(newUser);
        await this.updateRefreshToken(newUser.id, tokens.refreshToken);

        const { passwordHash, hashed_refresh_token, ...userPayload } = newUser;
        return { ...tokens, user: userPayload };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const { passwordHash, hashed_refresh_token, ...userPayload } = user;
        return { ...tokens, user: userPayload };
    }

    async logout(userId: number): Promise<boolean> {
        const result = await this.userService.setRefreshToken(userId, null);
        // Safely check the result from the database operation
        return (result.affected ?? 0) > 0;
    }

    async refreshTokens(userId: number, rt: string) {
        const user = await this.userService.findById(userId);
        if (!user || !user.hashed_refresh_token) {
            throw new ForbiddenException('Access Denied');
        }

        const rtMatches = await bcrypt.compare(rt, user.hashed_refresh_token);
        if (!rtMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    private async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.userService.findByEmail(email);
        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                return user;
            }
        }
        return null;
    }

    async validateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.userService.findById(userId);
        if (!user || !user.hashed_refresh_token) {
            return null;
        }
        const isValid = await bcrypt.compare(refreshToken, user.hashed_refresh_token);
        return isValid ? user : null;
    }
}