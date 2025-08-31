import { Exclude } from "class-transformer";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("email", ["email"], { unique: true })
@Index("google_id", ["googleId"], { unique: true })
@Index("idx_auth_provider", ["authProvider"], {})
@Index("username", ["username"], { unique: true })
@Entity("users", { schema: "krait_chess" })
export class User {
    @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
    id: number;

    @Column("varchar", { name: "username", unique: true, length: 50 })
    username: string;

    @Column("int", { name: "elo_rating", default: () => "'1200'" })
    eloRating: number;

    @Column("varchar", { name: "email", unique: true, length: 255 })
    email: string;

    @Column("varchar", { name: "password_hash", nullable: true, length: 255 })
    passwordHash: string | null;

    @Column("varchar", {
        name: "google_id",
        nullable: true,
        unique: true,
        length: 255,
    })
    googleId: string | null;

    @Column("enum", { name: "auth_provider", enum: ["local", "google"] })
    authProvider: "local" | "google";

    @Column("tinyint", { name: "is_verified", width: 1, default: () => "'0'" })
    isVerified: boolean;

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

    @Column({ type: 'varchar', length: 255, nullable: true })
    @Exclude() // Always exclude sensitive fields from responses
    public hashed_refresh_token: string | null;
}
