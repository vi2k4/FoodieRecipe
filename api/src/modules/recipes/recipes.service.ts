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
}
