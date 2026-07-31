import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  Prisma,
  RecipeDifficulty,
  RecipeImageType,
} from 'src/generated/prisma/client';
import { GeneratedIngredientDto } from '../dto/request/generated-ingredient-recipe.dto';
import { GeneratedRecipeDto } from '../dto/request/generated-recipe.dto';

@Injectable()
export class RecipePersistenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lưu Recipe
   */
  async createRecipe(
    tx: Prisma.TransactionClient,
    recipe: GeneratedRecipeDto,
    userId: number,
    imageUrl?: string,
  ) {
    return tx.recipe.create({
      data: {
        userId: BigInt(userId),
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cookTime,
        difficulty: this.mapDifficulty(recipe.difficulty),
        servings: recipe.servings,
        calories: recipe.nutrition?.calories,
        thumbnail: imageUrl,
        source: 'AI_BEDROCK',
        isPublic: false,
      },
    });
  }

  /**
   * Lưu Ingredients
   */
  async createRecipeIngredients(
    tx: Prisma.TransactionClient,
    recipeId: bigint,
    ingredients: GeneratedIngredientDto[],
  ) {
    if (!ingredients.length) return;

    await tx.recipeIngredient.createMany({
      data: ingredients.map((item, index) => ({
        recipeId,

        ingredientName: item.name,

        quantity: this.parseQuantity(item.amount),

        unit: this.parseUnit(item.amount),

        displayOrder: index + 1,
      })),
    });
  }

  /**
   * Lưu Steps
   */
  async createRecipeSteps(
    tx: Prisma.TransactionClient,
    recipeId: bigint,
    steps: string[],
  ) {
    if (!steps.length) return;

    await tx.recipeStep.createMany({
      data: steps.map((step, index) => ({
        recipeId,

        stepNumber: index + 1,

        content: step,
      })),
    });
  }

  async createRecipeImage(
    tx: Prisma.TransactionClient,
    recipeId: bigint,
    imageUrl: string,
  ) {
    await tx.recipeImage.create({
      data: {
        recipeId,
        imageUrl,
        type: RecipeImageType.AI_GENERATED,
        displayOrder: 1,
      },
    });
  }

  /**
   * Lưu toàn bộ công thức AI vào PostgreSQL trong một transaction.
   */
  async saveGeneratedRecipe(
    recipe: GeneratedRecipeDto,
    userId: number,
    imageUrl?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const createdRecipe = await this.createRecipe(
        tx,
        recipe,
        userId,
        imageUrl,
      );

      await this.createRecipeIngredients(
        tx,
        createdRecipe.id,
        recipe.ingredients,
      );

      await this.createRecipeSteps(tx, createdRecipe.id, recipe.steps);

      if (imageUrl) {
        await this.createRecipeImage(tx, createdRecipe.id, imageUrl);
      }

      return createdRecipe;
    });
  }

  /**
   * Mapping Difficulty
   */
  private mapDifficulty(level: string): RecipeDifficulty {
    switch (level.toLowerCase()) {
      case 'dễ':
      case 'easy':
        return RecipeDifficulty.EASY;

      case 'trung bình':
      case 'medium':
        return RecipeDifficulty.MEDIUM;

      case 'khó':
      case 'hard':
        return RecipeDifficulty.HARD;

      default:
        return RecipeDifficulty.EASY;
    }
  }

  /**
   * "200g" -> 200
   */
  private parseQuantity(amount: string): Prisma.Decimal | null {
    const match = amount.match(/[\d.]+/);

    if (!match) return null;

    return new Prisma.Decimal(match[0]);
  }

  /**
   * "200g" -> "g"
   */
  private parseUnit(amount: string): string | null {
    const match = amount.match(/[a-zA-ZÀ-ỹ]+$/);

    return match ? match[0] : null;
  }
}
