import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

enum GameVariant {
    STANDARD = 'standard',
}
enum TimeControl {
    UNLIMITED = 'unlimited',
}
enum GameStatus {
    CREATED = 'created',
    ONGOING = 'ongoing',
    FINISHED = 'finished',
    ABORTED = 'aborted',
}
enum GameResult {
    WHITE_WIN = 'white_win',
    BLACK_WIN = 'black_win',
    DRAW = 'draw',
    ONGOING = 'ongoing',
    ABORTED = 'aborted',
}

enum Visibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
}
export class CreateGameDto {
    @ApiPropertyOptional({ example: 'standard', description: 'The variant of the chess game (e.g., standard, chess960)' })
    @IsString()
    @IsEnum(GameVariant)
    @IsOptional()
    variant?: GameVariant; // for phase 1 only keep 'standard'
    @ApiPropertyOptional({ example: 'unlimited', description: 'The time control for the game (e.g., unlimited, 5+0, 3+2)' })
    @IsString()
    @IsEnum(TimeControl)
    @IsOptional()
    timeControl?: TimeControl; // for phase 1 only keep 'unlimited'
    @ApiPropertyOptional({ example: 'ongoing', description: 'The status of the game (e.g., created, ongoing, finished, aborted)' })
    @IsString()
    @IsOptional()
    status?: GameStatus;
    @ApiPropertyOptional({ example: 'created', description: 'The result of the game (e.g., white_win, black_win, draw, ongoing, aborted)' })
    @IsString()
    @IsEnum(GameResult)
    @IsOptional()
    result?: GameResult;
    @ApiPropertyOptional({ example: 0, description: 'The number of moves made in the game' })
    @IsInt()
    @Min(0)
    moves_count?: number | 0;
    @ApiPropertyOptional({ example: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', description: 'The current FEN string representing the game state' })
    @IsString()
    @IsOptional()
    current_fen?: string | 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    @ApiPropertyOptional({ example: 'public', description: 'The visibility of the game (e.g., public, private)' })
    @IsString()
    @IsEnum(Visibility)
    @IsOptional()
    visiblity?: Visibility;
    @ApiPropertyOptional({ example: '', description: 'started at' })
    @IsOptional()
    started_at?: Date | null;
    @ApiPropertyOptional({ example: '', description: 'finished at' })
    @IsOptional()
    finished_at?: Date | null;
    @ApiPropertyOptional({ example: '', description: 'created at' })
    @IsOptional()
    created_at?: Date;
    @ApiPropertyOptional({ example: '', description: 'termination reason' })
    @IsString()
    @IsOptional()
    termination_reason?: string | null;
    @IsOptional()
    userId?: string; // will be set in the controller based on the authenticated user
}
