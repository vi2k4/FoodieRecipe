// response/generate-recipe-response.dto.ts

import { AIGenerationStatus } from '../../enums/ai-generation-status.enum';

export class GenerateRecipeResponseDto {
  jobId!: string;

  status!: AIGenerationStatus;

  message!: string;
}
