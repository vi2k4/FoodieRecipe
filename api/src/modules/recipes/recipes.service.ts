import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    search?: string;
    categoryId?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, isPublic: true };

    if (params?.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }
    if (params?.categoryId) {
      where.categoryId = BigInt(params.categoryId);
    }
    if (params?.difficulty) {
      where.difficulty = params.difficulty;
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
          category: {
            select: { id: true, name: true, icon: true },
          },
          recipeTags: {
            include: { tag: true },
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

  async findById(id: bigint) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        ingredients: {
          orderBy: { displayOrder: 'asc' },
        },
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        recipeTags: {
          include: { tag: true },
        },
        _count: {
          select: { comments: true, likes: true, favorites: true },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    // Tăng view count
    await this.prisma.recipe.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return recipe;
  }
}
