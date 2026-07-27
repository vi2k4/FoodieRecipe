import {
  GeneratedIngredientDto,
  NutritionDto,
} from './generated-ingredient-recipe.dto';

export class GeneratedRecipeDto {
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
