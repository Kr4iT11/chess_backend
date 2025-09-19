import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_msg_from", ["fromUserId"], {})
@Index("idx_msg_to", ["toUserId"], {})
@Entity("messages", { schema: "krait_chess" })
export class Message {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "from_user_id", unsigned: true })
  fromUserId: string;

  @Column("bigint", { name: "to_user_id", unsigned: true })
  toUserId: string;

  @Column("text", { name: "content" })
  content: string;

  @Column("tinyint", {
    name: "is_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRead: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.messages, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "from_user_id", referencedColumnName: "id" }])
  fromUser: User;

  @ManyToOne(() => User, (users) => users.messages2, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "to_user_id", referencedColumnName: "id" }])
  toUser: User;
}
