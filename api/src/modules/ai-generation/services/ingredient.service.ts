import { Injectable } from '@nestjs/common';

export interface Ingredient {
  name: string;
  confidence: number;
}

@Injectable()
export class IngredientService {
  /**
   * Những label không phải nguyên liệu
   */
  private readonly ignoreLabels = new Set([
    'Food',
    'Meal',
    'Dish',
    'Cuisine',
    'Recipe',
    'Plate',
    'Tableware',
    'Bowl',
    'Kitchen',
    'Produce',
    'Vegetable',
    'Fruit',
    'Ingredient',
    'Plant',
  ]);

  /**
   * Chuẩn hóa tên nguyên liệu
   */
  private readonly ingredientMap: Record<string, string> = {
    Scallion: 'Green Onion',
    SpringOnion: 'Green Onion',
    Aubergine: 'Eggplant',
    Coriander: 'Cilantro',
    Bellpepper: 'Bell Pepper',
    Chilli: 'Chili',
    ChilliPepper: 'Chili Pepper',
  };

  extractIngredients(
    labels: {
      Name?: string;
      Confidence?: number;
    }[],
  ): Ingredient[] {
    return (
      labels
        .filter((label) => !!label.Name)
        .filter((label) => (label.Confidence ?? 0) >= 80)
        .filter((label) => !this.ignoreLabels.has(label.Name!))
        .map((label) => ({
          name: this.normalize(label.Name!),
          confidence: Number((label.Confidence ?? 0).toFixed(2)),
        }))
        // loại bỏ trùng
        .filter(
          (item, index, self) =>
            self.findIndex((x) => x.name === item.name) === index,
        )
        // confidence cao trước
        .sort((a, b) => b.confidence - a.confidence)
    );
  }

  private normalize(name: string): string {
    return this.ingredientMap[name] ?? name;
  }
}
