import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(private readonly _userService: UserService, private readonly _jwtService: JwtService) {

    }
    async validateUser(email: string, password: string): Promise<any> {
        // get user from email
        const user = await this._userService.findByEmail(email);
        if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
            const { passwordHash, ...result } = user; // we get output in user then what we do is we remove passwordHash from the user and create a new object called as ...result 
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials')
        }
        return this.generateTokenResponse(user);
    }

    async register(createUserDto: CreateUserDto) {
        const { email, username, password } = createUserDto;
        // check if user exists by email 
        const existingUserByEmail = await this._userService.findByEmail(email);
        if (existingUserByEmail) {
            throw new ConflictException("Email already exists");
        }
        // Check if username exists
        const existingUserByUserName = await this._userService.findByUsername(username);
        if (existingUserByUserName) {
            throw new ConflictException("Username already exists")
        }
        // Hash the password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        // Ensure createUser returns the created user with its ID
        const newUser = await this._userService.createUser(createUserDto, hashedPassword);
        return this.generateTokenResponse(newUser)
    }
    private generateTokenResponse(user: any) {
        const { passwordHash, ...userPayload } = user; // Securely remove password hash
        const payload = { username: userPayload.username, sub: userPayload.id };
        if (!userPayload.id) {
            // This check prevents JWT signing errors
            throw new Error('User ID is missing after creation.');
        }
        return {
            access_token: this._jwtService.sign(payload),
            user: userPayload, // Return the clean user object
        };
    }
}
