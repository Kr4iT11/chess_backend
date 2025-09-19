import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tournament } from "./Tournaments";
import { User } from "./Users";

@Index("idx_tp_tournament", ["tournamentId"], {})
@Index("idx_tp_user", ["userId"], {})
@Entity("tournament_players", { schema: "krait_chess" })
export class TournamentPlayer {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "tournament_id", unsigned: true })
  tournamentId: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("int", { name: "seed", nullable: true })
  seed: number | null;

  @Column("float", {
    name: "score",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  score: number | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["registered", "playing", "withdrawn", "disqualified"],
    default: () => "'registered'",
  })
  status: "registered" | "playing" | "withdrawn" | "disqualified" | null;

  @ManyToOne(
    () => Tournament,
    (tournaments) => tournaments.tournamentPlayers,
    { onDelete: "CASCADE", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "tournament_id", referencedColumnName: "id" }])
  tournament: Tournament;

  @ManyToOne(() => User, (users) => users.tournamentPlayers, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
