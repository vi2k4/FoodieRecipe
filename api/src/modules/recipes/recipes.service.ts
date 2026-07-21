import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    search?: string;
    category?: string;
    maxCalories?: number;
    maxCookTime?: number;
    difficulty?: string;
  }) {
    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    if (filters) {
      const { search, category, maxCalories, maxCookTime, difficulty } = filters;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        const categoryId = parseInt(category, 10);
        if (!isNaN(categoryId)) {
          where.categoryId = BigInt(categoryId);
        } else {
          where.category = {
            name: { equals: category, mode: 'insensitive' },
          };
        }
      }

      if (maxCalories !== undefined && !isNaN(maxCalories)) {
        where.calories = { lte: maxCalories };
      }

      if (maxCookTime !== undefined && !isNaN(maxCookTime)) {
        where.cookTime = { lte: maxCookTime };
      }

      if (difficulty && difficulty !== 'ALL') {
        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        const upperDifficulty = difficulty.toUpperCase();
        if (validDifficulties.includes(upperDifficulty)) {
          where.difficulty = upperDifficulty;
        }
      }
    }

    return this.prisma.recipe.findMany({
      where,
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: bigint) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: true,
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
          include: {
            tag: true,
          },
        },
      },
    });
  }
}
