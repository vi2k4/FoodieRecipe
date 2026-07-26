import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async rateRecipe(userId: bigint, recipeId: bigint, ratingDto: RatingDto) {
    const { rating } = ratingDto;

    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Upsert rating
    await this.prisma.rating.upsert({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        recipeId,
        rating,
      },
    });

    // 3. Recalculate average rating
    await this.updateRecipeAverageRating(recipeId);

    return { message: 'Recipe rated successfully', rating };
  }

  async updateRating(userId: bigint, recipeId: bigint, ratingDto: RatingDto) {
    const { rating } = ratingDto;

    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if rating exists
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!existingRating) {
      throw new NotFoundException('You have not rated this recipe yet');
    }

    // 3. Update rating
    await this.prisma.rating.update({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
      data: {
        rating,
      },
    });

    // 4. Recalculate average rating
    await this.updateRecipeAverageRating(recipeId);

    return { message: 'Rating updated successfully', rating };
  }

  async deleteRating(userId: bigint, recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if rating exists
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    // 3. Delete rating
    await this.prisma.rating.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    // 4. Recalculate average rating
    await this.updateRecipeAverageRating(recipeId);

    return { message: 'Rating deleted successfully' };
  }

  private async updateRecipeAverageRating(recipeId: bigint) {
    const aggregate = await this.prisma.rating.aggregate({
      where: { recipeId },
      _avg: {
        rating: true,
      },
    });

    const averageRating = aggregate._avg.rating || 0;

    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: {
        averageRating,
      },
    });
  }
}
