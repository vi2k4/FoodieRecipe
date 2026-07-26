export class CreateRecipeDto {
  userId?: bigint | number | string;
  title: string;
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
