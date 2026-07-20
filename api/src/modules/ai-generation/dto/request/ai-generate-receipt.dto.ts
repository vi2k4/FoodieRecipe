// request/generate-recipe.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateRecipeDto {
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
