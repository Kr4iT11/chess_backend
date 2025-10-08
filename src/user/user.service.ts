import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/Users';
import { Repository, UpdateResult } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { MAX } from 'class-validator';
import { UserProfile } from '../entities/UserProfiles';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { LOCK_MINUTES, MAX_FAILED } from '../auth/constant/auth.constant';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(UserProfile) private readonly userProfileRepository: Repository<UserProfile>) {
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async createUser(_createUserDto: CreateUserDto): Promise<User> {

        const existingUser = await this.findByEmailOrUsername(_createUserDto.email || _createUserDto.username);
        console.log('existing user', existingUser);
        if (existingUser) {
            if (existingUser.email === _createUserDto.email) throw new BadRequestException('Email already in use');
            throw new BadRequestException('Username already in use');
        }
        const hash = await argon2.hash(_createUserDto.password);
        if (!hash) throw new Error('Failed to hash password');
        _createUserDto.password = hash;
        console.log('creating user', _createUserDto);
        console.log('uuidv4', uuidv4());
        const newUser = this.usersRepository.create({
            ..._createUserDto,
            passwordHash: _createUserDto.password,
            uuid: uuidv4(),
            emailVerified: true, // for development set to true, later implement email verification
        });
        const savedUser = await this.usersRepository.save(newUser, { reload: true });
        const profile = this.userProfileRepository.create({
            user: savedUser, // Since userRepository.save with reload: true returns the full entity with ID
            displayName: _createUserDto.username,
            rating: 1200,
            provisional: true, // default values
        });

        const useProfile = await this.userProfileRepository.save(profile);
        if (!useProfile) throw new Error('Failed to create user profile'); // add here logging over here
        return savedUser;
    }

    async findByEmailOrUsername(identifier: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: [{ email: identifier }, { username: identifier }] });
    }

    // async setRefreshToken(
    //     userId: number,
    //     refreshToken: string | null,
    // ): Promise<UpdateResult> {
    //     return this.usersRepository.update(userId, {
    //         hashed_refresh_token: refreshToken,
    //     });
    // }
    sanitizeForClient(user: User) {
        return {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
        };
    }

    async incrementFailedLogin(userId: string) {
        // const user = await this.usersRepository.findOne({ where: { id: userId } });
        const user = await this.findById(userId);
        if (!user) return;
        user.failedLoginCount = (user.failedLoginCount || 0) + 1;
        if (user.failedLoginCount >= MAX_FAILED) {
            const until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
            user.lockUntil = until;
        }
        await this.usersRepository.save(user);
    }

    async resetFailedLogin(userId: string) {
        const user = await this.findById(userId);
        if (!user) return;
        await this.usersRepository.update({ id: userId }, { failedLoginCount: 0, lockUntil: null });
    }
    async isAccountLocked(user: User) { // to check if the account is locked or not 
        if (!user) return false;
        if (!user.lockUntil) return false;
        return user.lockUntil > new Date();
    }

    async recordLastLogin(userId: string) {
        await this.usersRepository.update({ id: userId }, { lastLoginAt: new Date() });
    }

    async findDisplayNameByUserId(userId: string): Promise<string | null> {
        const profile = await this.userProfileRepository.findOne({ where: { user: { id: userId } } });
        return profile ? profile.displayName : null;
    }
}
