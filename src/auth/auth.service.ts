import { Injectable, UnauthorizedException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../entities/Users';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SECONDS, COOKIE_COMMON, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_TTL_MS, SESSION_ID_COOKIE } from './constant/auth.constant';
import { Request, Response } from 'express';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/RefreshTokens';
import { InjectRepository } from '@nestjs/typeorm';

const logger = new Logger('AuthService');

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    private async signAccessToken(user: User) {
        const payload = { sub: user.id, username: user.username };
        console.log(this.configService.get<string>('JWT_SECRET'));
        return await this.jwtService.signAsync(payload, {
            // secret: this.configService.get<string>('JWT_SECRET'),
            secret: this.configService.get<string>('JWT_ACCESS_SECRET') || this.configService.get<string>('JWT_SECRET'),
            // expiresIn: this.configService.get<string>('JWT_ACCESS_EXP') || '3600s',
            expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s`,
        });
    }

    /**
     * This methods registers a new user using the provided CreateUserDto.
     * It hashes the password, creates the user, and returns a sanitized user object without sensitive fields.
     * @param createUserDto The DTO containing user registration details
     * @returns sanatized user object without sensitive fields
     */
    async registerLocal(createUserDto: CreateUserDto) {
        console.log('registering user', createUserDto);
        const createdUser = await this.userService.createUser(createUserDto);
        return this.userService.sanitizeForClient(createdUser);
    }

    /**
     * This method is used to validate the user credentials during login 
     * @param identifier either email or username
     * @param plainPassword plain password to be verified
     * @returns returns the user object if valid, null otherwise
     */
    async validateLocal(identifier: string, plainPassword: string) {
        // find user either by email or username and set it into identifier variable
        // check if its active or has a lock session
        // compare the hashedpassword with the plain password using argon2 verify
        // if not match increment the failed login attempts 
        // if match reset the failed login attempts and return the user object
        const user = await this.userService.findByEmailOrUsername(identifier);
        if (!user) return null;

        // check active and lock status
        if (!user.isActive) {
            throw new BadRequestException('Account is inactive. Please contact support.');
        }
        if (await this.userService.isAccountLocked(user)) {
            throw new BadRequestException(`Account is locked until ${user.lockUntil?.toISOString()}`);
        }
        if (!user.passwordHash) return null;
        const ok = await argon2.verify(user.passwordHash, plainPassword);
        if (!ok) {
            // increment failed login attempts and possibly lock account
            await this.userService.incrementFailedLogin(user.id);
            return null;
        }
        // success: reset failed counter and return user
        await this.userService.resetFailedLogin(user.id);
        return user;
    }

    async loginLocal(user: User, res: Response, req: Request) {
        // Check if email is verified or not 
        if (!user.emailVerified) {
            throw new BadRequestException('Email not verified');
        }

        // procceed to create refresh session
        const sessionId = uuidv4(); // generate a new session ID
        const refreshPlain = randomBytes(64).toString('hex'); // generate a secure random refresh token
        const tokenHash = await argon2.hash(refreshPlain);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        // this has to go to its own refresh token service
        // save the refresh token in the database
        const refreshToken = this.refreshTokenRepository.create({
            sessionId,
            user,
            tokenHash,
            expiresAt,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null,
        });
        await this.refreshTokenRepository.save(refreshToken);

        const accessToken = await this.signAccessToken(user);
        console.log('accessToken', accessToken);
        const isProd = false; // this.configService.get<string>('NODE_ENV') === 'production';

        // set cookies on respoonse parameters
        res.cookie(SESSION_ID_COOKIE, sessionId, { ...COOKIE_COMMON, secure: isProd, maxAge: REFRESH_TOKEN_TTL_MS });
        res.cookie(REFRESH_TOKEN_COOKIE, refreshPlain, { ...COOKIE_COMMON, secure: isProd, maxAge: REFRESH_TOKEN_TTL_MS });
        res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_COMMON, secure: isProd, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 });

        // update the last login 
        await this.userService.recordLastLogin(user.id);

        // return access token and user info
        return {
            accessToken,
            user: this.userService.sanitizeForClient(user)
        }
    }

    /**
     * This takes 2 parameters request and response. it checkes the session id and refresh token from the request cookies
     * if valid, it rotates the refresh token and issues a new access token. it also sets the new cookies in the response
     * 
     * @param req Takes the request to get the session id and refresh token cookies
     * @param res To set the new cookies when rotating the refresh token
     * @returns void
     */
    async refresh(req: Request, res: Response) {
        const sessionId = req.cookies?.[SESSION_ID_COOKIE];
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        if (!sessionId || !refreshToken) {
            throw new UnauthorizedException('No session or refresh token');
        }
        const session = await this.refreshTokenRepository.findOne({ where: { sessionId }, relations: ['user'] });
        if (!session) {
            throw new UnauthorizedException('Invalid session');
        }
        if (session.revokedAt) {
            throw new UnauthorizedException('Session revoked');
        }
        if (session.expiresAt < new Date()) {
            throw new UnauthorizedException('Session expired');
        }

        // verify the refreshToken with the hashed refresh token in the db 
        console.log('verifying refresh token for session', sessionId);
        console.log('provided refresh token', refreshToken);
        console.log('stored token hash', session.tokenHash);
        console.log('this is argon verify',await argon2.verify(session.tokenHash, refreshToken));
        const matches = await argon2.verify(session.tokenHash, refreshToken).catch(() => false);
        console.log('refresh token matches', matches);
        if (!matches) {
            // revoke the session
            await this.refreshTokenRepository.update(session.id, { revokedAt: new Date() });
            throw new UnauthorizedException('Invalid refresh token');
        }
        // all good, proceed to rotate the refresh token
        const newRefreshPlain = randomBytes(64).toString('hex');
        const newRefreshPlainHash = await argon2.hash(newRefreshPlain);
        // create new expiry date 
        session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
        console.log('new expiry date', session.expiresAt.toISOString());
        // create new refresh token entry 
        session.tokenHash = newRefreshPlainHash;
        // rotated from the previous one
        session.rotatedFrom = session.id;
        // fill the ipaddress 
        session.ipAddress = req.ip as string | null;
        session.userAgent = (req.headers['user-agent'] as string | undefined) ?? null;
        // save the session
        await this.refreshTokenRepository.save(session);

        const accessToken = await this.signAccessToken(session.user);
        const isProd = false // process.env.NODE_ENV === 'production';

        res.cookie(REFRESH_TOKEN_COOKIE, newRefreshPlain, { ...COOKIE_COMMON, secure: isProd, maxAge: REFRESH_TOKEN_TTL_MS });
        res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_COMMON, secure: isProd, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 });
        res.cookie(SESSION_ID_COOKIE, sessionId, { ...COOKIE_COMMON, secure: isProd, maxAge: REFRESH_TOKEN_TTL_MS });
        console.log(res.getHeaders());
        logger.log(`refresh rotated: user=${session.user.id} session=${sessionId}`);
        console.log('new accessToken', accessToken);
        return { accessToken };
    }

    /**
     * this method logs out the user from the current session. it will take session id from the request cookies and then update the revoke time
     * @param req Takes the request to get the session id cookie
     * @param res To clear the cookies when logging out
     * @returns void
     */
    async logout(req: Request, res: Response) {
        // first take the session id from the cookie 
        // update the session id revoke time 
        // clear the cookies
        const sessionId = req.cookies?.[SESSION_ID_COOKIE];
        if (sessionId) {
            await this.refreshTokenRepository.update({ sessionId }, { revokedAt: new Date() })
        }
        const isProd = false; // process.env.NODE_ENV === 'production';
        res.clearCookie(REFRESH_TOKEN_COOKIE, { ...COOKIE_COMMON, secure: isProd });
        res.clearCookie(SESSION_ID_COOKIE, { ...COOKIE_COMMON, secure: isProd });
        res.clearCookie(ACCESS_TOKEN_COOKIE, { ...COOKIE_COMMON, secure: isProd });
    }

    /**
     * A user can have multiple active sessions this method revokes all sessions
     * @param userId The user id whose sessions are to be revoked
     * @param res To clear the cookies when logging out.
     * @returns void
     */
    async logoutAllSessions(userId: number, res: Response) {
        // first update all sessions of the user to revoked
        await this.refreshTokenRepository.update({ user: { id: userId } as any }, { revokedAt: new Date() })
        if (res) {
            const isProd = process.env.NODE_ENV === 'production';
            res.clearCookie(REFRESH_TOKEN_COOKIE, { ...COOKIE_COMMON, secure: isProd });
            res.clearCookie(SESSION_ID_COOKIE, { ...COOKIE_COMMON, secure: isProd });
            res.clearCookie(ACCESS_TOKEN_COOKIE, { ...COOKIE_COMMON, secure: isProd });
        }
    }
}