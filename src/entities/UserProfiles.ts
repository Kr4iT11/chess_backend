import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("user_id", ["userId"], { unique: true })
@Entity("user_profiles", { schema: "krait_chess" })
export class UserProfile {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unique: true, unsigned: true })
  userId: string;

  @Column("varchar", { name: "display_name", nullable: true, length: 100 })
  displayName: string | null;

  @Column("text", { name: "bio", nullable: true })
  bio: string | null;

  @Column("char", { name: "country", nullable: true, length: 2 })
  country: string | null;

  @Column("int", { name: "rating", default: () => "'1200'" })
  rating: number;

  @Column("tinyint", { name: "provisional", width: 1, default: () => "'1'" })
  provisional: boolean;

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

  @Column("varchar", { name: "first_name", nullable: true, length: 50 })
  firstName: string | null;

  @Column("varchar", { name: "last_name", nullable: true, length: 50 })
  lastName: string | null;

  @OneToOne(() => User, (users) => users.userProfiles, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
