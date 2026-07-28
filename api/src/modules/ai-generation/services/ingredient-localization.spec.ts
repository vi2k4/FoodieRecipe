import { localizeDetectedIngredients } from './ingredient-localization';

describe('localizeDetectedIngredients', () => {
  it('keeps the English source name when a translation is missing', () => {
    const result = localizeDetectedIngredients(
      [
        { name: 'Tomato', confidence: 98.5 },
        { name: 'Dragon Fruit', confidence: 91 },
      ],
      [{ sourceName: 'Tomato', name: 'Cà chua' }],
    );

    expect(result).toEqual([
      { name: 'Cà chua', confidence: 98.5 },
      { name: 'Dragon Fruit', confidence: 91 },
    ]);
  });

  it('returns every source ingredient when no translations are available', () => {
    const ingredients = [
      { name: 'Tomato', confidence: 98.5 },
      { name: 'Dragon Fruit', confidence: 91 },
    ];

    expect(localizeDetectedIngredients(ingredients, [])).toEqual(ingredients);
  });
});
