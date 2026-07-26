import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationType } from '../../../generated/prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Internal method to create a notification, called by other services
   */
  async createNotification(data: {
    userId: bigint;
    title: string;
    content: string;
    type: NotificationType;
    referenceId?: bigint;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        referenceId: data.referenceId,
      },
    });
  }

  async getNotifications(userId: bigint) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // The schema doesn't have a direct relation to the "sender" user for a notification,
      // so we rely on the frontend or additional logic to parse standard title/content.
    });

    return notifications.map((n) => ({
      ...n,
      id: n.id.toString(),
      userId: n.userId.toString(),
      referenceId: n.referenceId?.toString() || null,
    }));
  }

  async markAsRead(userId: bigint, notificationId: bigint) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      userId: updated.userId.toString(),
      referenceId: updated.referenceId?.toString() || null,
    };
  }

  async markAllAsRead(userId: bigint) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(userId: bigint, notificationId: bigint) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true, message: 'Notification deleted successfully' };
  }
}
