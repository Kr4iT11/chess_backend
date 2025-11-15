import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RealtimeService } from "./realtime.service";
import { RealtimeGateway } from "./realtime.gateway";

@Controller('realtime')
@UseGuards(JwtAuthGuard)
@ApiTags('realtime') // Groups endpoints under the "realtime" tag in Swagger
@ApiBearerAuth('JWT-auth')
export class RealtimeController {
    constructor(private readonly _realtimeService: RealtimeService, private readonly realtimeGateway: RealtimeGateway) { }


    @Get('notifications')
    @ApiOperation({ summary: 'Get all list of notifications' })
    @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully.' })
    async getNotifications(@Req() req, @Query('page') page: number) {
        // get user id from req
        const userId = req.user.id.toString();
        // fetch notifications from database
        const notifications = await this._realtimeService.listNotifications(userId, page, 20); // need to implement pagination
        return notifications;
    }

    @Post('mark-read')
    @ApiOperation({ summary: 'Mark all or single notification as read' })
    @ApiResponse({ status: 200 })
    async markRead(@Req() req, @Body() body: { notificationId?: string }) {
        const userId = req.user.id;
        if (body.notificationId) {
            return this._realtimeService.markAsRead(userId, body.notificationId);
        } else {
            return this._realtimeService.markAllRead(userId);
        }
    }

    @Get('testnotification/:userId')
    @ApiOperation({ summary: 'Testing notifications' })
    @ApiResponse({ status: 200 })
    async testEmit(@Param('userId') userId: string) {
        console.log('Emitting test notification to user:', userId);
        this.realtimeGateway.listSocketsInRoom(userId); // for debugging
        this.realtimeGateway.emitToUser(userId, 'notifications:new', {
            id: `dev-${Date.now()}`,
            type: 'friend_request',
            payload: { displayName: 'Dev Tester' },
            isRead: false,
            createdAt: new Date().toISOString()
        });
        return { ok: true };
    }


}