export interface Ingredient {
  name: string;
  confidence: number;
}

export interface GeneratedIngredient {
  name: string;
  amount: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface SavedRecipe {
  id: number;
  title: string;
  description: string;
  cookTime: number;
  difficulty: string;
  servings: number;
  ingredients: GeneratedIngredient[];
  steps: string[];
  tips?: string;
  nutrition?: Nutrition;
  thumbnail?: string;
}

export interface AnalyzeImageResponse {
  labels: { name: string; confidence: number }[];
  ingredients: Ingredient[];
  recipe: SavedRecipe;
  historyId: number;
}
