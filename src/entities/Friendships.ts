import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_friend_user_a", ["userAId"], {})
@Index("idx_friend_user_b", ["userBId"], {})
@Index("uniq_friend_requests", ["userAId", "userBId"], { unique: true })
@Entity("friendships", { schema: "krait_chess" })
export class Friendship {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_a_id", unsigned: true })
  userAId: string;

  @Column("bigint", { name: "user_b_id", unsigned: true })
  userBId: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @Column("tinyint", { name: "is_deleted", width: 1, default: () => "'0'" })
  isDeleted: boolean;

  @Column("json", { name: "metadata", nullable: true })
  metadata: object | null;

  @ManyToOne(() => User, (users) => users.friendships, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_a_id", referencedColumnName: "id" }])
  userA: User;

  @ManyToOne(() => User, (users) => users.friendships2, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_b_id", referencedColumnName: "id" }])
  userB: User;
}
