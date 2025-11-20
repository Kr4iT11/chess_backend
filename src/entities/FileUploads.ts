import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./Users";

@Index("fk_file_user", ["userId"], {})
@Entity("file_uploads", { schema: "krait_chess" })
export class FileUpload {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", nullable: true, unsigned: true })
  userId: string | null;

  @Column("varchar", { name: "filename", length: 512 })
  filename: string;

  @Column("varchar", { name: "storage_key", length: 1024 })
  storageKey: string;

  @Column("varchar", { name: "mime_type", nullable: true, length: 255 })
  mimeType: string | null;

  @Column("bigint", { name: "size_bytes", nullable: true, unsigned: true })
  sizeBytes: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
  
  @Column("bit", { name: "is_profile", nullable: true })
  isProfile: boolean | null;

  @ManyToOne(() => User, (users) => users.fileUploads, {
    onDelete: "SET NULL",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
