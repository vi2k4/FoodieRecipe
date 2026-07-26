import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async favoriteRecipe(userId: bigint, recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if already favorited
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (existingFavorite) {
      return { message: 'Recipe already in favorites', favorited: true };
    }

    // 3. Create favorite and increment favoriteCount
    await this.prisma.$transaction([
      this.prisma.favorite.create({
        data: {
          userId,
          recipeId,
        },
      }),
      this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Recipe added to favorites successfully', favorited: true };
  }

  async unfavoriteRecipe(userId: bigint, recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Check if favorite exists
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!existingFavorite) {
      throw new NotFoundException('Recipe is not in your favorites');
    }

    // 3. Delete favorite and decrement favoriteCount
    await this.prisma.$transaction([
      this.prisma.favorite.delete({
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
          favoriteCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Recipe removed from favorites successfully', favorited: false };
  }

  async getFavorites(userId: bigint) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav) => fav.recipe);
  }
}
