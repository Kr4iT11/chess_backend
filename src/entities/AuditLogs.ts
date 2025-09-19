import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_audit_user", ["userId"], {})
@Entity("audit_logs", { schema: "krait_chess" })
export class AuditLog {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", nullable: true, unsigned: true })
  userId: string | null;

  @Column("varchar", { name: "action", length: 255 })
  action: string;

  @Column("varchar", { name: "ip_address", nullable: true, length: 45 })
  ipAddress: string | null;

  @Column("varchar", { name: "user_agent", nullable: true, length: 512 })
  userAgent: string | null;

  @Column("json", { name: "meta", nullable: true })
  meta: object | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.auditLogs, {
    onDelete: "SET NULL",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
