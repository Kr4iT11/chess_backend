import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RealtimeService } from "./realtime.service";

@Controller('realtime')
@UseGuards(JwtAuthGuard)
@ApiTags('realtime') // Groups endpoints under the "realtime" tag in Swagger
@ApiBearerAuth('JWT-auth')
export class RealtimeController {
    constructor(private readonly _realtimeService: RealtimeService) { }

    @Get('notifications')
    @ApiOperation({ summary: 'Get all list of notifications' })
    @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully.' })
    async getNotifications(@Req() req) {
        // get user id from req
        const userId = req.user.id.toString();
        // fetch notifications from database
        const notifications = await this._realtimeService.listNotifications(userId, 1, 50); // need to implement pagination
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

}