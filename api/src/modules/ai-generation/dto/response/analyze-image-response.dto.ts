// response/analyze-image-response.dto.ts

import { LabelDto } from './label.dto';
import {
  GeneratedIngredientDto,
  NutritionDto,
} from '../request/generated-ingredient-recipe.dto';

export class IngredientDto {
  name!: string;
  confidence!: number;
}

export class SavedRecipeDto {
  id!: number;
  title!: string;
  description!: string;
  cookTime!: number;
  difficulty!: string;
  servings!: number;
  ingredients!: GeneratedIngredientDto[];
  steps!: string[];
  tips?: string;
  nutrition?: NutritionDto;
  thumbnail?: string;
}

export class AnalyzeImageResponseDto {
  labels!: LabelDto[];
  ingredients!: IngredientDto[];
  recipe!: SavedRecipeDto;
  historyId!: number;
}
