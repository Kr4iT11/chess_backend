import {
    Column,
    DeepPartial,
    Entity,
    FindOptionsOrder,
    FindOptionsSelect,
    FindOptionsWhere,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './Games';
import { User } from './Users';

@Index('uq_game_side', ['gameId', 'side'], { unique: true })
@Index('unique_active_game_per_user', ['userId', 'isActive'], { unique: true })
@Index('idx_gp_game', ['gameId'], {})
@Index('idx_gp_user', ['userId'], {})
@Entity('game_players', { schema: 'krait_chess' })
export class GamePlayer {
    public static getTableName() {
        return `game_players`;
    }

    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
    id: string;

    @Column('bigint', { name: 'game_id', unsigned: true })
    gameId: string;

    @Column('bigint', { name: 'user_id', nullable: true, unsigned: true })
    userId: string | null;

    @Column('enum', { name: 'side', enum: ['white', 'black'] })
    side: 'white' | 'black';

    @Column('int', { name: 'rating_before', nullable: true })
    ratingBefore: number | null;

    @Column('int', { name: 'rating_after', nullable: true })
    ratingAfter: number | null;

    @Column('tinyint', { name: 'is_bot', width: 1, default: () => "'0'" })
    isBot: boolean;

    @Column('timestamp', { name: 'disconnected_at', nullable: true })
    disconnectedAt: Date | null;

    @Column('enum', {
        name: 'result',
        nullable: true,
        enum: ['win', 'loss', 'draw', 'unknown'],
        default: () => "'unknown'",
    })
    result: 'win' | 'loss' | 'draw' | 'unknown' | null;

    @Column('tinyint', { name: 'is_winner', nullable: true, width: 1, default: () => "'0'" })
    isWinner: boolean | null;

    @Column('tinyint', { name: 'isActive', width: 1, default: () => "'1'" })
    isActive: boolean;

    @ManyToOne(() => Game, (games) => games.gamePlayers, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
    @JoinColumn([{ name: 'game_id', referencedColumnName: 'id' }])
    game: Game;

    @ManyToOne(() => User, (users) => users.gamePlayers, { onDelete: 'SET NULL', onUpdate: 'NO ACTION' })
    @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
    user: User;
}