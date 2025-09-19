import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("fk_leader_user", ["userId"], {})
@Index("idx_leader_scope_date", ["scope", "referenceDate"], {})
@Index("uq_leader_scope_date_user", ["scope", "referenceDate", "userId"], {
  unique: true,
})
@Entity("leaderboards", { schema: "krait_chess" })
export class Leaderboard {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("enum", {
    name: "scope",
    enum: ["global", "monthly", "weekly", "daily", "friends"],
    default: () => "'global'",
  })
  scope: "global" | "monthly" | "weekly" | "daily" | "friends";

  @Column("date", { name: "reference_date", nullable: true })
  referenceDate: string | null;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("int", { name: "player_rank" })
  playerRank: number;

  @Column("float", { name: "score", precision: 12 })
  score: number;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.leaderboards, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
