import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Permission } from "./Permissions";
import { UserRole } from "./UserRoles";

@Index("name", ["name"], { unique: true })
@Entity("roles", { schema: "krait_chess" })
export class Role {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 255 })
  description: string | null;

  @ManyToMany(() => Permission, (permissions) => permissions.roles)
  permissions: Permission[];

  @OneToMany(() => UserRole, (userRoles) => userRoles.role)
  userRoles: UserRole[];
}
