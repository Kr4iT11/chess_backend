import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {

    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } })
    }

    async findById(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } })
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } })
    }

    async createUser(_createUserDto: CreateUserDto, hashedPassword_hash: string): Promise<User> {
        const newUser = this.usersRepository.create({
            ..._createUserDto,
            passwordHash: hashedPassword_hash,
            authProvider: 'local',
            isVerified: false,
        });
        // console.log('User object after creation:', newUser);
        // const result = await this.usersRepository.save(newUser, { reload: true });
        // console.log(result);
        // return result;
        return this.usersRepository.save(newUser, { reload: true });;
    }
}
