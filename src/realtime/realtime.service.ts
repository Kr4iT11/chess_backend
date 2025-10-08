import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendNotification } from '../entities/FriendNotifications';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { RealtimeGateway } from './realtime.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class RealtimeService {
    private gateway: RealtimeGateway | null = null;
    constructor(@InjectRepository(FriendNotification) private _friendNotifications: Repository<FriendNotification>) {
    }
    setGateway(gateway: RealtimeGateway) {
        this.gateway = gateway;
    }
    async createAndEmitFriendNotification(notification: CreateNotificationDto) {
        try {
            const newNotification = this._friendNotifications.create({
                userId: notification.userId.toString(),
                type: notification.type,
                payload: notification.payload || {},
                referenceId: notification.referenceId || null,
                isRead: false,
                createdAt: new Date(),
            });
            const saved = await this._friendNotifications.save(newNotification);
            this.gateway?.emitToUser(notification.userId.toString(), 'friend_notification', saved); // event name: 'friend_notification', payload: saved notification object
            return saved;
        } catch (error) {
            console.error('Error creating or emitting friend notification:', error);
        }
    }

    async markAllRead(userId: string) {
        // mark all undelivered notifications as delivered
        await this._friendNotifications
            .createQueryBuilder()
            .update()
            .set({ isRead: true, readAt: new Date() })
            .where('user_id = :userId', { userId: String(userId) })
            .execute();
        this.gateway?.emitToUser(userId, 'notifications:all_read', { userId });
        return { success: true };
    }

    async markAsRead(userId: string, notificationId: string) {
        const n = await this._friendNotifications.findOne({ where: { id: notificationId } as any });
        if (!n || String(n.userId) !== String(userId)) return null;
        n.isRead = true;
        await this._friendNotifications.save(n);

        this.gateway?.emitToUser(userId, 'notifications:updated', { id: n.id, isRead: true });
        return n;
    }
    countUnread(userId: string | number) {
        return this._friendNotifications.count({ where: { userId: String(userId), isRead: false } });
    }

    getUnread(userId: string | number) {
        return this._friendNotifications.find({
            where: { userId: String(userId), isRead: false },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async listNotifications(userId: string, page = 1, pageSize = 20) {
        const [items, total] = await this._friendNotifications.findAndCount({
            where: { userId: String(userId) },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize
        });
        return { items, total, page, pageSize };
    }
    async deliverPendingNotifications(userId: string) {
        const pending = await this._friendNotifications.find({
            where: { userId, isRead: false } as FindOptionsWhere<FriendNotification>,
            order: { createdAt: 'DESC' },
            take: 20,
        });
        this.gateway?.emitToUser(userId, 'notifications:initial', pending);
        return pending;
    }
}
