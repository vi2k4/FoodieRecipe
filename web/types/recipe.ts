export interface RecipeAuthor {
  id: number | string;
  username: string;
  email?: string;
}

export interface RecipeCategory {
  id: number | string;
  name: string;
  icon?: string;
}

export interface RecipeIngredient {
  id: number | string;
  recipeId?: number | string;
  ingredientName: string;
  quantity?: number | string;
  unit?: string;
  displayOrder?: number;
}

export interface RecipeStep {
  id: number | string;
  recipeId?: number | string;
  stepNumber: number;
  content: string;
}

export interface RecipeTag {
  id: number | string;
  name: string;
}

export interface RecipeCount {
  comments?: number;
  likes?: number;
  favorites?: number;
}

export interface Recipe {
  id: number | string;
  title: string;
  image?: string;
  thumbnail?: string;
  description: string;

  visibility?: "PUBLIC" | "PRIVATE";
  isPublic?: boolean;

  cookingTime?: number;
  cookTime?: number;

  calories?: number;

  difficulty?: string;

  servings?: number;

  source?: string;

  viewCount?: number;
  likeCount?: number;
  favoriteCount?: number;

  createdAt?: string;
  updatedAt?: string;

  author?: RecipeAuthor;
  category?: RecipeCategory;

  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  tags?: RecipeTag[];
  images?: { id: number | string; imageUrl: string; type?: string }[];

  _count?: RecipeCount;
}
