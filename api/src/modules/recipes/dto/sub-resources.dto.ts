export class CreateIngredientDto {
  ingredientName: string;
  quantity?: number;
  unit?: string;
  displayOrder?: number;
}

export class UpdateIngredientDto {
  ingredientName?: string;
  quantity?: number;
  unit?: string;
  displayOrder?: number;
}

export class CreateStepDto {
  stepNumber: number;
  content: string;
}

export class UpdateStepDto {
  stepNumber?: number;
  content?: string;
}

export class CreateImageDto {
  imageUrl: string;
  type?:
    'THUMBNAIL' | 'INGREDIENT' | 'STEP' | 'RESULT' | 'AI_GENERATED' | 'OTHER';
  displayOrder?: number;
}
