import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_fr_from_status", ["fromUserId", "status"], {})
@Index("idx_fr_to_status", ["toUserId", "status"], {})
@Index("uq_fr_pending_pair_new", ["fromUserId", "toUserId", "isPending"], {
  unique: true,
})
@Entity("friend_requests", { schema: "krait_chess" })
export class FriendRequest {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "from_user_id", nullable: true, unsigned: true })
  fromUserId: string | null;

  @Column("bigint", { name: "to_user_id", nullable: true, unsigned: true })
  toUserId: string | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["pending", "accepted", "decline", "expired", "cancelled"],
    default: () => "'pending'",
  })
  status: "pending" | "accepted" | "decline" | "expired" | "cancelled" | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column("timestamp", { name: "responded_at", nullable: true })
  respondedAt: Date | null;

  @Column("timestamp", { name: "expires_at" })
  expiresAt: Date;

  @Column("json", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("tinyint", { name: "is_pending", nullable: true, width: 1 })
  isPending: boolean | null;

  @ManyToOne(() => User, (users) => users.friendRequests, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "from_user_id", referencedColumnName: "id" }])
  fromUser: User;

  @ManyToOne(() => User, (users) => users.friendRequests2, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "to_user_id", referencedColumnName: "id" }])
  toUser: User;
}
