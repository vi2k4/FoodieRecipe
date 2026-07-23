import { NotificationType } from '../../../generated/prisma/client';

export class NotificationDto {
  id!: string;
  userId!: string;
  title!: string;
  content!: string;
  type!: NotificationType;
  referenceId?: string | null;
  isRead!: boolean;
  createdAt!: Date;
}
