export class QueryRecipeDto {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string;
  difficulty?: string;
  isPublic?: boolean | string;
  userId?: number | string;
}
