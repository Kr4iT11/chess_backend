import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../../user/user.service';

const ACCESS_TOKEN_COOKIE = 'access_token';

const cookieExtractor = (req: Request): string | null => {

    if (req && req.cookies && req.cookies.access_token) {
        return req.cookies.access_token;
    }
    return null;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService, private readonly userService: UserService,) {
        super({
            jwtFromRequest: (req: Request) => {
                // ✅ Try cookie first
                const token = cookieExtractor(req);
                if (token) return token;
                return ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
            },
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string || configService.get<string>('JWT_SECRET') as string,
        });
    }

    // validate will be called with the decoded payload
    async validate(payload: any) {
        // you can still fetch more user info if needed
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        // return the user object that will be attached to req.user
        return this.userService.sanitizeForClient(user); // or user sanitized
    }
}
