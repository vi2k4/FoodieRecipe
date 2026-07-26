import { Controller, Get, Patch, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    // req.user.id is string from JWT, convert to bigint
    const userId = BigInt(req.user.id);
    return this.notificationsService.getNotifications(userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = BigInt(req.user.id);
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    const userId = BigInt(req.user.id);
    return this.notificationsService.markAsRead(userId, BigInt(id));
  }

  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') id: string) {
    const userId = BigInt(req.user.id);
    return this.notificationsService.deleteNotification(userId, BigInt(id));
  }
}
