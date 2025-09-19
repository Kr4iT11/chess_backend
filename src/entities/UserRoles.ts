import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Role } from "./Roles";
import { User } from "./Users";

@Index("fk_ur_role", ["roleId"], {})
@Entity("user_roles", { schema: "krait_chess" })
export class UserRole {
  @Column("bigint", { primary: true, name: "user_id", unsigned: true })
  userId: string;

  @Column("bigint", { primary: true, name: "role_id", unsigned: true })
  roleId: string;

  @Column("timestamp", {
    name: "assigned_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt: Date;

  @ManyToOne(() => Role, (roles) => roles.userRoles, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => User, (users) => users.userRoles, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
