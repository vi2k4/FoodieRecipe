export class UpdateRecipeDto {
  title?: string;
  description?: string;
  categoryId?: bigint | number;
  calories?: number;
  cookTime?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  servings?: number;
  thumbnail?: string;
  source?: string;
  isPublic?: boolean;
}
