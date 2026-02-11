import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from "class-validator";


export class CreateGameDto {
    @ApiProperty({ example: 'standard', description: 'The variant of the chess game (e.g., standard, chess960)' })
    @IsString()
    variant: string | 'standard'; // for phase 1 only keep 'standard'
    @ApiProperty({ example: 'unlimited', description: 'The time control for the game (e.g., unlimited, 5+0, 3+2)' })
    @IsString()
    timeControl: string | 'unlimited'; // for phase 1 only keep 'unlimited'
    @ApiProperty({ example: 'ongoing', description: 'The status of the game (e.g., created, ongoing, finished, aborted)' })
    @IsString()
    status: string | 'created' | 'ongoing' | 'finished' | 'aborted';
    @ApiProperty({ example: 'created', description: 'The result of the game (e.g., white_win, black_win, draw, ongoing, aborted)' })
    @IsString()
    result: string | 'white_win' | 'black_win' | 'draw' | 'ongoing' | 'aborted';
    @ApiProperty({ example: 0, description: 'The number of moves made in the game' })
    @IsInt()
    @Min(0)
    moves_count: number | 0;
    @ApiProperty({ example: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', description: 'The current FEN string representing the game state' })
    @IsString()
    current_fen: string;
    @ApiProperty({ example: 'public', description: 'The visibility of the game (e.g., public, private)' })
    @IsString()
    visiblity: string | 'public' | 'private';
    @ApiProperty({ example: '', description: 'started at' })
    started_at: Date | null;
    @ApiProperty({ example: '', description: 'finished at' })
    finished_at: Date | null;
    @ApiProperty({ example: '', description: 'created at' })
    created_at: Date;
    @ApiProperty({ example: '', description: 'termination reason' })
    @IsString()
    termination_reason: string | null;
    userId: string; // will be set in the controller based on the authenticated user
}
