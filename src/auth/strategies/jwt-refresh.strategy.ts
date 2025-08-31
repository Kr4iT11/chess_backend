import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService, private readonly authService: AuthService,) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // This function extracts the token from the cookie
                (req: Request) => {
                    return req.cookies?.['refresh_token'];
                },
            ]),
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') as string,
            passReqToCallback: true, // Pass the request object to the validate method
        });
    }

    /**
     * This validate method is called after the token is successfully verified.
     * It returns the user payload and the refresh token itself.
     */
    // validate(req: Request, payload: any) {
    //     const refreshToken = req.cookies['refresh_token'];
    //     console.log('referesh token from jwt referesh strartergy', refreshToken)
    //     return { ...payload, refreshToken };
    // }
    async validate(req: Request, payload: any) {
        // const refreshToken = req.cookies?.['refresh_token'];
        const refreshToken = req?.cookies?.refreshToken;
        const user = this.authService.validateRefreshToken(payload.sub, refreshToken)
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return user; // will be available as req.user
    }
}