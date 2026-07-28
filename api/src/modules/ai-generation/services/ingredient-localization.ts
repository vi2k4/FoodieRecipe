import { GeneratedRecipeDto } from '../dto/request/generated-recipe.dto';
import { IngredientDto } from '../dto/response/analyze-image-response.dto';

export function localizeDetectedIngredients(
  ingredients: IngredientDto[],
  translations: GeneratedRecipeDto['detectedIngredients'],
): IngredientDto[] {
  if (!ingredients.length) return [];

  const translationMap = new Map(
    translations
      .filter(
        (item) =>
          typeof item?.sourceName === 'string' &&
          typeof item?.name === 'string' &&
          item.name.trim().length > 0,
      )
      .map((item) => [
        item.sourceName.trim().toLocaleLowerCase(),
        item.name.trim(),
      ]),
  );

  return ingredients.map((ingredient) => ({
    name:
      translationMap.get(ingredient.name.trim().toLocaleLowerCase()) ??
      ingredient.name,
    confidence: ingredient.confidence,
  }));
}
