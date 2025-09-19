import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_block_blocked", ["blockedId"], {})
@Index("idx_block_blocker", ["blockerId"], {})
@Index("uq_block_pair", ["blockerId", "blockedId"], { unique: true })
@Entity("blocks", { schema: "krait_chess" })
export class Block {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "blocker_id", unsigned: true })
  blockerId: string;

  @Column("bigint", { name: "blocked_id", unsigned: true })
  blockedId: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @Column("tinyint", { name: "is_deleted", width: 1, default: () => "'0'" })
  isDeleted: boolean;

  @Column("varchar", { name: "reason", nullable: true, length: 512 })
  reason: string | null;

  @ManyToOne(() => User, (users) => users.blocks, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "blocked_id", referencedColumnName: "id" }])
  blocked: User;

  @ManyToOne(() => User, (users) => users.blocks2, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "blocker_id", referencedColumnName: "id" }])
  blocker: User;
}
