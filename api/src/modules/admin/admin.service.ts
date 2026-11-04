import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '../../generated/prisma/client';
import { NotificationsService } from '../social/notifications/notifications.service';
import { NotificationType } from '../../generated/prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPendingRecipes() {
    return this.prisma.recipe.findMany({
      where: { isPublic: false, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, username: true, email: true, avatarUrl: true } }, category: true },
    });
  }

  async reviewRecipe(id: bigint, approved: boolean) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, isPublic: false, deletedAt: null },
      include: { author: { select: { id: true, username: true } } },
    });
    if (!recipe) throw new NotFoundException('Không tìm thấy công thức đang chờ duyệt');

    const result = approved
      ? await this.prisma.recipe.update({ where: { id }, data: { isPublic: true } })
      : await this.prisma.recipe.update({ where: { id }, data: { deletedAt: new Date() } });

    await this.notificationsService.createNotification({
      userId: recipe.author.id,
      title: approved ? 'Công thức đã được phê duyệt' : 'Công thức chưa được phê duyệt',
      content: approved
        ? `Công thức "${recipe.title}" đã được đăng công khai.`
        : `Công thức "${recipe.title}" đã bị từ chối bởi quản trị viên.`,
      type: NotificationType.SYSTEM,
      referenceId: recipe.id,
    });
    return result;
  }

  async getUsers(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleUserLock(id: bigint, isLocked: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isLocked },
    });
  }

  async updateUserRole(id: bigint, role: UserRole, requesterId: bigint) {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Role không hợp lệ');
    }
    if (id === requesterId) {
      throw new ForbiddenException('Không thể tự thay đổi role của chính mình');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async deleteUser(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRecipes(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      data: recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleRecipeVisibility(id: bigint, isPublic: boolean) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    return this.prisma.recipe.update({
      where: { id },
      data: { isPublic },
    });
  }

  async deleteRecipe(id: bigint) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });


    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    return this.prisma.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
