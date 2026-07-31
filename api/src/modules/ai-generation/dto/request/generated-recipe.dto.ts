import {
  GeneratedIngredientDto,
  NutritionDto,
} from './generated-ingredient-recipe.dto';

export class TranslatedDetectedIngredientDto {
  sourceName!: string;

  name!: string;
}

export class GeneratedRecipeDto {
  detectedIngredients!: TranslatedDetectedIngredientDto[];

  title!: string;

  description!: string;

  cookTime!: number;

  difficulty!: string;

  servings!: number;

  ingredients!: GeneratedIngredientDto[];

  steps!: string[];

  tips?: string;

  nutrition?: NutritionDto;
}
