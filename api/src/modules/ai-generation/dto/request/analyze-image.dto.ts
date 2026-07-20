// request/analyze-image.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeImageDto {
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
