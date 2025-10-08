export class CreateNotificationDto {
    userId: string;
    type: 'friend_request' | 'friend_accept' | 'friend_decline' | 'invite' | 'invite_cancel'
    referenceId?: string;
    payload?: any;
}