import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("idx_authprov_user", ["userId"], {})
@Index("uq_authprov_provider_user", ["providerName", "providerUserId"], {
  unique: true,
})
@Entity("auth_providers", { schema: "krait_chess" })
export class AuthProvider {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("varchar", { name: "provider_name", length: 50 })
  providerName: string;

  @Column("varchar", { name: "provider_user_id", length: 255 })
  providerUserId: string;

  @Column("text", { name: "access_token", nullable: true })
  accessToken: string | null;

  @Column("text", { name: "refresh_token", nullable: true })
  refreshToken: string | null;

  @Column("timestamp", { name: "expires_at", nullable: true })
  expiresAt: Date | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.authProviders, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
