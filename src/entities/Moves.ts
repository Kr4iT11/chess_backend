import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Game } from "./Games";
import { User } from "./Users";

@Index("fk_moves_user", ["createdBy"], {})
@Index("idx_moves_game_ply", ["gameId", "ply"], {})
@Entity("moves", { schema: "krait_chess" })
export class Move {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "game_id", unsigned: true })
  gameId: string;

  @Column("int", { name: "ply" })
  ply: number;

  @Column("varchar", { name: "san", length: 100 })
  san: string;

  @Column("varchar", { name: "uci", nullable: true, length: 10 })
  uci: string | null;

  @Column("text", { name: "fen_after", nullable: true })
  fenAfter: string | null;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  createdBy: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Game, (games) => games.moves, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "game_id", referencedColumnName: "id" }])
  game: Game;

  @ManyToOne(() => User, (users) => users.moves, {
    onDelete: "SET NULL",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;
}
