import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Achievement } from "./Achievements";
import { User } from "./Users";

@Index("fk_userach_ach", ["achievementId"], {})
@Index("uq_user_achievement", ["userId", "achievementId"], { unique: true })
@Entity("user_achievements", { schema: "krait_chess" })
export class UserAchievement {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("bigint", { name: "achievement_id", unsigned: true })
  achievementId: string;

  @Column("timestamp", {
    name: "awarded_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  awardedAt: Date;

  @ManyToOne(
    () => Achievement,
    (achievements) => achievements.userAchievements,
    { onDelete: "CASCADE", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "achievement_id", referencedColumnName: "id" }])
  achievement: Achievement;

  @ManyToOne(() => User, (users) => users.userAchievements, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
