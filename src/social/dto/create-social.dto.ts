import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSocialDto {
    @ApiProperty({ example: '1', description: 'from user id' })
    @IsString()
    @IsNotEmpty()
    fromUserId: string;

    @ApiProperty({ example: '2', description: 'to user id' })
    @IsString()
    @IsNotEmpty()
    toUserId: string;
}
