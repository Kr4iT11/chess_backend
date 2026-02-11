import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GamePlayer } from "./GamePlayers";
import { Move } from "./Moves";

@Index("idx_games_created_at", ["createdAt"], {})
@Index("idx_games_status", ["status"], {})
@Index("uuid", ["uuid"], { unique: true })
@Entity("games", { schema: "krait_chess" })
export class Game {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("char", { name: "uuid", unique: true, length: 36 })
  uuid: string;

  @Column("varchar", {
    name: "variant",
    length: 50,
    default: () => "'standard'",
  })
  variant: string;

  @Column("varchar", { name: "time_control", nullable: true, length: 50 })
  timeControl: string | null;

  @Column("enum", {
    name: "status",
    enum: ["created", "ongoing", "finished", "aborted"],
    default: () => "'created'",
  })
  status: "created" | "ongoing" | "finished" | "aborted";

  @Column("enum", {
    name: "result",
    enum: ["white_win", "black_win", "draw", "ongoing", "aborted"],
    default: () => "'ongoing'",
  })
  result: "white_win" | "black_win" | "draw" | "ongoing" | "aborted";

  @Column("int", { name: "moves_count", default: () => "'0'" })
  movesCount: number;

  @Column("varchar", {
    name: "termination_reason",
    nullable: true,
    length: 100,
  })
  terminationReason: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", { name: "started_at", nullable: true })
  startedAt: Date | null;

  @Column("timestamp", { name: "finished_at", nullable: true })
  finishedAt: Date | null;

  @Column("enum", {
    name: "visibility",
    enum: ["public", "private"],
    default: () => "'public'",
  })
  visibility: "public" | "private";

  @OneToMany(() => GamePlayer, (gamePlayers) => gamePlayers.game)
  gamePlayers: GamePlayer[];

  @OneToMany(() => Move, (moves) => moves.game)
  moves: Move[];

  @Column("text", { name: "current_fen", nullable: true })
  currentFen: string | null;
}
