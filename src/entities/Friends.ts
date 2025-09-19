import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_friend_requested", ["requestedId"], {})
@Index("idx_friend_requester", ["requesterId"], {})
@Index("uq_friend_pair", ["requesterId", "requestedId"], { unique: true })
@Entity("friends", { schema: "krait_chess" })
export class Friend {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "requester_id", unsigned: true })
  requesterId: string;

  @Column("bigint", { name: "requested_id", unsigned: true })
  requestedId: string;

  @Column("enum", {
    name: "status",
    enum: ["pending", "accepted", "declined", "blocked"],
    default: () => "'pending'",
  })
  status: "pending" | "accepted" | "declined" | "blocked";

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.friends, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "requested_id", referencedColumnName: "id" }])
  requested: User;

  @ManyToOne(() => User, (users) => users.friends2, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "requester_id", referencedColumnName: "id" }])
  requester: User;
}
