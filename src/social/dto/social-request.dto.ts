import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SocialRequestDto {
    @ApiProperty({ example: '2', description: 'to user id' })
    @IsString()
    @IsNotEmpty()
    toUserId: string;
}
