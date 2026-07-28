export class AIGenerationHistoryDto {
  id!: number;
  prompt!: string;
  detectedLabels!: string[];
  createdAt!: Date;
  imageUrl!: string;
  model!: string;
  recipeId?: number;
  status!: 'pending' | 'processing' | 'success' | 'failed';
  userId!: number;
}
