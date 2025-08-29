import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";



export class LoginDto {
    @ApiProperty({ example: 'you@example.com', description: 'user name' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @ApiProperty({ example: 'strongP@ssw0rd', description: 'password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}