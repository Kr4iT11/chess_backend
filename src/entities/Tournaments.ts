import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TournamentPlayer } from "./TournamentPlayers";
import { User } from "./Users";

@Index("fk_tourn_organizer", ["organizerUserId"], {})
@Index("idx_tourn_status", ["status"], {})
@Index("uuid", ["uuid"], { unique: true })
@Entity("tournaments", { schema: "krait_chess" })
export class Tournament {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("char", { name: "uuid", unique: true, length: 36 })
  uuid: string;

  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Column("bigint", {
    name: "organizer_user_id",
    nullable: true,
    unsigned: true,
  })
  organizerUserId: string | null;

  @Column("enum", {
    name: "type",
    enum: ["swiss", "round_robin", "knockout", "arena"],
    default: () => "'swiss'",
  })
  type: "swiss" | "round_robin" | "knockout" | "arena";

  @Column("enum", {
    name: "status",
    enum: ["upcoming", "running", "finished", "cancelled"],
    default: () => "'upcoming'",
  })
  status: "upcoming" | "running" | "finished" | "cancelled";

  @Column("timestamp", { name: "start_date", nullable: true })
  startDate: Date | null;

  @Column("timestamp", { name: "end_date", nullable: true })
  endDate: Date | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(
    () => TournamentPlayer,
    (tournamentPlayers) => tournamentPlayers.tournament
  )
  tournamentPlayers: TournamentPlayer[];

  @ManyToOne(() => User, (users) => users.tournaments, {
    onDelete: "SET NULL",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "organizer_user_id", referencedColumnName: "id" }])
  organizerUser: User;
}
