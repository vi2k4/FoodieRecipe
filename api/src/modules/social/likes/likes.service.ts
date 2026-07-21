import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async likeRecipe(userId: bigint, recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if already liked
    const existingLike = await this.prisma.recipeLike.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (existingLike) {
      return { message: 'Recipe already liked', liked: true };
    }

    // 3. Create like and increment likeCount atomically
    await this.prisma.$transaction([
      this.prisma.recipeLike.create({
        data: {
          userId,
          recipeId,
        },
      }),
      this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Recipe liked successfully', liked: true };
  }

  async unlikeRecipe(userId: bigint, recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if like exists
    const existingLike = await this.prisma.recipeLike.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('You have not liked this recipe');
    }

    // 3. Delete like and decrement likeCount atomically
    await this.prisma.$transaction([
      this.prisma.recipeLike.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      }),
      this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Recipe unliked successfully', liked: false };
  }
}
