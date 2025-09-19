import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AuditLog } from "./AuditLogs";
import { AuthProvider } from "./AuthProviders";
import { Avatar } from "./Avatars";
import { Block } from "./Blocks";
import { EloRatingHistory } from "./EloRatingHistory";
import { FileUpload } from "./FileUploads";
import { FriendNotification } from "./FriendNotifications";
import { FriendRequest } from "./FriendRequests";
import { Friend } from "./Friends";
import { Friendship } from "./Friendships";
import { GamePlayer } from "./GamePlayers";
import { Leaderboard } from "./Leaderboards";
import { Message } from "./Messages";
import { Move } from "./Moves";
import { Notification } from "./Notifications";
import { RefreshToken } from "./RefreshTokens";
import { TournamentPlayer } from "./TournamentPlayers";
import { Tournament } from "./Tournaments";
import { UserAchievement } from "./UserAchievements";
import { UserProfile } from "./UserProfiles";
import { UserRole } from "./UserRoles";

@Index("idx_users_created_at", ["createdAt"], {})
@Index("idx_users_email", ["email"], {})
@Index("username", ["username"], { unique: true })
@Index("uuid", ["uuid"], { unique: true })
@Entity("users", { schema: "krait_chess" })
export class User {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("char", { name: "uuid", unique: true, length: 36 })
  uuid: string;

  @Column("varchar", { name: "username", unique: true, length: 50 })
  username: string;

  @Column("varchar", { name: "email", nullable: true, length: 255 })
  email: string | null;

  @Column("tinyint", { name: "email_verified", width: 1, default: () => "'0'" })
  emailVerified: boolean;

  @Column("varchar", { name: "password_hash", nullable: true, length: 255 })
  passwordHash: string | null;

  @Column("tinyint", { name: "is_active", width: 1, default: () => "'1'" })
  isActive: boolean;

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

  @Column("timestamp", { name: "last_login_at", nullable: true })
  lastLoginAt: Date | null;

  @Column("int", { name: "failed_login_count", default: () => "'0'" })
  failedLoginCount: number;

  @Column("timestamp", { name: "lock_until", nullable: true })
  lockUntil: Date | null;

  @OneToMany(() => AuditLog, (auditLogs) => auditLogs.user)
  auditLogs: AuditLog[];

  @OneToMany(() => AuthProvider, (authProviders) => authProviders.user)
  authProviders: AuthProvider[];

  @OneToMany(() => Avatar, (avatars) => avatars.user)
  avatars: Avatar[];

  @OneToMany(() => Block, (blocks) => blocks.blocked)
  blocks: Block[];

  @OneToMany(() => Block, (blocks) => blocks.blocker)
  blocks2: Block[];

  @OneToMany(
    () => EloRatingHistory,
    (eloRatingHistory) => eloRatingHistory.user
  )
  eloRatingHistories: EloRatingHistory[];

  @OneToMany(() => FileUpload, (fileUploads) => fileUploads.user)
  fileUploads: FileUpload[];

  @OneToMany(
    () => FriendNotification,
    (friendNotifications) => friendNotifications.user
  )
  friendNotifications: FriendNotification[];

  @OneToMany(() => FriendRequest, (friendRequests) => friendRequests.fromUser)
  friendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequests) => friendRequests.toUser)
  friendRequests2: FriendRequest[];

  @OneToMany(() => Friend, (friends) => friends.requested)
  friends: Friend[];

  @OneToMany(() => Friend, (friends) => friends.requester)
  friends2: Friend[];

  @OneToMany(() => Friendship, (friendships) => friendships.userA)
  friendships: Friendship[];

  @OneToMany(() => Friendship, (friendships) => friendships.userB)
  friendships2: Friendship[];

  @OneToMany(() => GamePlayer, (gamePlayers) => gamePlayers.user)
  gamePlayers: GamePlayer[];

  @OneToMany(() => Leaderboard, (leaderboards) => leaderboards.user)
  leaderboards: Leaderboard[];

  @OneToMany(() => Message, (messages) => messages.fromUser)
  messages: Message[];

  @OneToMany(() => Message, (messages) => messages.toUser)
  messages2: Message[];

  @OneToMany(() => Move, (moves) => moves.createdBy2)
  moves: Move[];

  @OneToMany(() => Notification, (notifications) => notifications.user)
  notifications: Notification[];

  @OneToMany(() => RefreshToken, (refreshTokens) => refreshTokens.user)
  refreshTokens: RefreshToken[];

  @OneToMany(
    () => TournamentPlayer,
    (tournamentPlayers) => tournamentPlayers.user
  )
  tournamentPlayers: TournamentPlayer[];

  @OneToMany(() => Tournament, (tournaments) => tournaments.organizerUser)
  tournaments: Tournament[];

  @OneToMany(
    () => UserAchievement,
    (userAchievements) => userAchievements.user
  )
  userAchievements: UserAchievement[];

  @OneToOne(() => UserProfile, (userProfiles) => userProfiles.user)
  userProfiles: UserProfile;

  @OneToMany(() => UserRole, (userRoles) => userRoles.user)
  userRoles: UserRole[];
}
