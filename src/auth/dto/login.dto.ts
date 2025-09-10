import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";



export class LoginDto {
    @ApiProperty({ example: 'test123', description: 'password' })
    @IsString()
    username: string;
    @ApiProperty({ example: 'you@example.com', description: 'user name' })
    @IsEmail()
    email: string;
    @ApiProperty({ example: 'strongP@ssw0rd', description: 'password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}