// response/analyze-image-response.dto.ts

import { LabelDto } from './label.dto';

export class AnalyzeImageResponseDto {
  labels!: LabelDto[];
}
