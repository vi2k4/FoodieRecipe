import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardService } from './dashboard.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../social/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService, DashboardService],
})
export class AdminModule {}
