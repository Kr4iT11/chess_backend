import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_fn_type", ["type"], {})
@Index("idx_fn_user_read", ["userId", "isRead"], {})
@Entity("friend_notifications", { schema: "krait_chess" })
export class FriendNotification {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("enum", {
    name: "type",
    enum: [
      "friend_request",
      "friend_accept",
      "friend_decline",
      "invite",
      "invite_cancel",
    ],
  })
  type:
    | "friend_request"
    | "friend_accept"
    | "friend_decline"
    | "invite"
    | "invite_cancel";

  @Column("char", { name: "reference_id", nullable: true, length: 36 })
  referenceId: string | null;

  @Column("json", { name: "payload", nullable: true })
  payload: object | null;

  @Column("tinyint", { name: "is_read", width: 1, default: () => "'0'" })
  isRead: boolean;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "read_at",
    nullable: true,
    default: null,
  })
  readAt: Date;

  @ManyToOne(() => User, (users) => users.friendNotifications, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
