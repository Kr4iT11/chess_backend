import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("fk_rt_rotated_from", ["rotatedFrom"], {})
@Index("idx_rt_token_hash", ["tokenHash"], {})
@Index("idx_rt_user_revoked", ["userId", "revokedAt"], {})
@Index("session_id", ["sessionId"], { unique: true })
@Entity("refresh_tokens", { schema: "krait_chess" })
export class RefreshToken {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("char", { name: "session_id", unique: true, length: 36 })
  sessionId: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("varchar", { name: "token_hash", length: 255 })
  tokenHash: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", { name: "expires_at" })
  expiresAt: Date;

  @Column("timestamp", { name: "revoked_at", nullable: true })
  revokedAt: Date | null;

  @Column("varchar", { name: "ip_address", nullable: true, length: 45 })
  ipAddress: string | null;

  @Column("varchar", { name: "user_agent", nullable: true, length: 512 })
  userAgent: string | null;

  @Column("bigint", { name: "rotated_from", nullable: true, unsigned: true })
  rotatedFrom: string | null;

  @ManyToOne(
    () => RefreshToken,
    (refreshTokens) => refreshTokens.refreshTokens,
    { onDelete: "SET NULL", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "rotated_from", referencedColumnName: "id" }])
  rotatedFrom2: RefreshToken;

  @OneToMany(() => RefreshToken, (refreshTokens) => refreshTokens.rotatedFrom2)
  refreshTokens: RefreshToken[];

  @ManyToOne(() => User, (users) => users.refreshTokens, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
