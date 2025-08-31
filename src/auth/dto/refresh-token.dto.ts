import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";


export class RefreshTokenDto {
    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: '1', description: 'id' })
    id: number;
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'refresh-token', description: 'refresh-token' })
    refreshToken: string;
}