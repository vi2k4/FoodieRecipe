import { SavedRecipeDto } from './analyze-image-response.dto';

export class GenerateRecipeResponseDto {
  ingredients!: string[];

  recipe!: SavedRecipeDto;

  historyId!: number;
}
