import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recipe.findMany({
      take: 10,
      include: {
        author: true,
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
