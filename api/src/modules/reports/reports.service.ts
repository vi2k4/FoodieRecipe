import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportStatus, NotificationType } from '../../generated/prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createReport(
    recipeId: bigint,
    reporterId: bigint,
    dto: CreateReportDto,
  ) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    if (recipe.userId === reporterId) {
      throw new BadRequestException('Bạn không thể báo cáo công thức của chính mình');
    }

    // Check duplicate report
    const existingReport = await this.prisma.report.findUnique({
      where: {
        recipeId_reporterId: {
          recipeId,
          reporterId,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('Bạn đã báo cáo công thức này trước đó');
    }

    const report = await this.prisma.report.create({
      data: {
        recipeId,
        reporterId,
        reason: dto.reason,
        description: dto.description || null,
        status: ReportStatus.PENDING,
      },
    });

    // Notify admins about the new report
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      await this.notificationsService.createNotification(
        admin.id,
        'Báo cáo vi phạm mới',
        `Công thức "${recipe.title}" bị báo cáo vì lý do: ${dto.reason}`,
        NotificationType.REPORT,
        report.id,
      );
    }

    return report;
  }

  async findAll(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : {},
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            userId: true,
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        handler: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleReport(id: bigint, handlerId: bigint, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { recipe: true },
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Báo cáo này đã được xử lý');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        handledBy: handlerId,
        handledAt: new Date(),
      },
    });

    if (dto.status === ReportStatus.RESOLVED) {
      // Hide recipe
      await this.prisma.recipe.update({
        where: { id: report.recipeId },
        data: { isPublic: false },
      });

      // Notify recipe author
      await this.notificationsService.createNotification(
        report.recipe.userId,
        'Công thức của bạn đã bị ẩn',
        `Công thức "${report.recipe.title}" đã bị ẩn do vi phạm tiêu chuẩn cộng đồng (Lý do: ${report.reason}).`,
        NotificationType.SYSTEM,
        report.recipeId,
      );
    }

    return updatedReport;
  }
}
