export function updateLikedRecipeIds(
  currentIds: Array<string | number>,
  recipeId: string | number,
  nextLiked: boolean,
): string[] {
  const recipeIdStr = String(recipeId);

  if (nextLiked) {
    if (currentIds.some((id) => String(id) === recipeIdStr)) {
      return currentIds.map((id) => String(id));
    }

    return [...currentIds.map((id) => String(id)), recipeIdStr];
  }

  return currentIds.map((id) => String(id)).filter((id) => id !== recipeIdStr);
}
