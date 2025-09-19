import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./Roles";

@Index("name", ["name"], { unique: true })
@Entity("permissions", { schema: "krait_chess" })
export class Permission {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 255 })
  description: string | null;

  @ManyToMany(() => Role, (roles) => roles.permissions)
  @JoinTable({
    name: "role_permissions",
    joinColumns: [{ name: "permission_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "role_id", referencedColumnName: "id" }],
    schema: "krait_chess",
  })
  roles: Role[];
}
