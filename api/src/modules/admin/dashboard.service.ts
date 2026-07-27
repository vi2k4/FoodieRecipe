import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ReportStatus } from '../../generated/prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalRecipes,
      totalComments,
      totalLikes,
      totalReports,
      totalAiGenerations,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.recipe.count({ where: { deletedAt: null } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.recipeLike.count(),
      this.prisma.report.count(),
      this.prisma.aIGenerationHistory.count(),
    ]);

    return {
      totalUsers,
      totalRecipes,
      totalComments,
      totalLikes,
      totalReports,
      totalAiGenerations,
    };
  }

  async getHighlightedRecipes() {
    return this.prisma.recipe.findMany({
      where: { deletedAt: null, isPublic: true },
      orderBy: [
        { likeCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: 5,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getPendingReports() {
    return this.prisma.report.findMany({
      where: { status: ReportStatus.PENDING },
      take: 5,
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatistics() {
    const stats = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      // Calculate start of day (midnight) for the target day in local/system time
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const [newUsers, newRecipes] = await Promise.all([
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        this.prisma.recipe.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      stats.push({
        date: dateString,
        users: newUsers,
        recipes: newRecipes,
      });
    }

    return stats;
  }
}
