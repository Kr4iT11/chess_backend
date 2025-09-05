// src/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    Index,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserProfile } from './user-profile.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    // Use uuidv4() at app side when creating new users
    @Column({ type: 'char', length: 36, unique: true })
    uuid: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    @Index({ unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @Index()
    email: string | null;

    @Column({ name: 'email_verified', type: 'tinyint', width: 1, default: 0 })
    emailVerified: boolean;

    // store argon2 hashed password here
    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash: string | null;

    @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date | null;

    @Column({ name: 'failed_login_count', type: 'int', default: 0 })
    failedLoginCount: number;

    @Column({ name: 'lock_until', type: 'timestamp', nullable: true })
    lockUntil: Date | null;

    /* Relations */

    @OneToMany(() => RefreshToken, (rt) => rt.user)
    refreshTokens: RefreshToken[];

    @OneToOne(() => UserProfile, (p) => p.user)
    profile: UserProfile;
}
