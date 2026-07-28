import { Injectable } from '@nestjs/common';
import { IngredientDto } from '../dto/response/analyze-image-response.dto';

@Injectable()
export class PromptBuilderService {
  buildRecipePromptFromNames(ingredientNames: string[]): string {
    const ingredients = ingredientNames.map((name) => ({
      name,
      confidence: 100,
    }));
    return this.buildRecipePrompt(ingredients, 'User provided ingredients');
  }

  buildRecipePrompt(
    ingredients: IngredientDto[],
    ingredientSource = 'Detected ingredients',
  ): string {
    const ingredientList = ingredients
      .map((i) => `- ${i.name} (${i.confidence}%)`)
      .join('\n');

    return `
You are a professional chef.

${ingredientSource}:

${ingredientList}

Requirements:

1. Create ONE recipe.
2. Use mainly the detected ingredients.
3. You may add common seasonings (salt, pepper, oil, sugar).
4. Do not invent expensive ingredients.
5. Return ONLY valid JSON.
6. Translate every detected ingredient name into natural Vietnamese.
7. In "detectedIngredients", return exactly ONE item for every input ingredient.
8. "sourceName" MUST be copied exactly from the input; do not add, remove, merge, or rename sourceName.

IMPORTANT:
- The recipe MUST be written entirely in Vietnamese.
- All fields must use Vietnamese.
- Every "detectedIngredients[].name" MUST be Vietnamese.
- Return ONLY valid JSON.
- Do not use markdown.

JSON Schema:

{
  "detectedIngredients": [
    {
      "sourceName": "Exact original detected name",
      "name": "Tên nguyên liệu bằng tiếng Việt"
    }
  ],
  "title": "",
  "description": "",
  "cookTime": 0,
  "difficulty": "",
  "servings": 0,
  "ingredients": [
    {
      "name": "",
      "amount": ""
    }
  ],
  "steps": [
    ""
  ],
  "tips": "",
  "nutrition": {
    "calories": 0,
    "protein": 0,
    "fat": 0,
    "carbohydrates": 0
  }
}
`;
  }
}
