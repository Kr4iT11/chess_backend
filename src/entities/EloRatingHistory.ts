import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_elo_game", ["gameId"], {})
@Index("idx_elo_user", ["userId"], {})
@Entity("elo_rating_history", { schema: "krait_chess" })
export class EloRatingHistory {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("bigint", { name: "game_id", nullable: true, unsigned: true })
  gameId: string | null;

  @Column("int", { name: "previous_rating" })
  previousRating: number;

  @Column("int", { name: "new_rating" })
  newRating: number;

  @Column("int", { name: "delta" })
  delta: number;

  @Column("int", { name: "k_factor" })
  kFactor: number;

  @Column("varchar", { name: "reason", nullable: true, length: 255 })
  reason: string | null;

  @Column("timestamp", {
    name: "recorded_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  recordedAt: Date;

  @ManyToOne(() => User, (users) => users.eloRatingHistories, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
