import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserAchievement } from "./UserAchievements";

@Index("key_name", ["keyName"], { unique: true })
@Entity("achievements", { schema: "krait_chess" })
export class Achievement {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "key_name", unique: true, length: 100 })
  keyName: string;

  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(
    () => UserAchievement,
    (userAchievements) => userAchievements.achievement
  )
  userAchievements: UserAchievement[];
}
