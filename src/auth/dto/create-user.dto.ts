import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: 'ChessMaster123', description: 'user name' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ example: 'you@example.com', description: 'email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'strongP@ssw0rd', description: 'The user password (at least 8 characters)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;

    // uuid?: string; // will be generated server side
}