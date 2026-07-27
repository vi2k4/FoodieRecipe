import { PrismaClient } from '../src/generated/prisma/client';
import { AIGenerationStatus } from '../src/generated/prisma/enums';

export async function seedAI(prisma: PrismaClient) {
  console.log('🌱 Seeding AI data...');

  await prisma.aIGenerationHistory.createMany({
    data: [
      {
        prompt: 'Generate healthy chicken salad',
        detectedLabels: ['chicken', 'salad', 'healthy'],
        createdAt: new Date(),
        imageUrl: 'https://picsum.photos/600/400?1',
        model: 'gpt-4.1',
        recipeId: 1,
        status: AIGenerationStatus.SUCCESS,
        userId: 1,
      },
      {
        prompt: 'Generate pasta recipe',
        detectedLabels: ['pasta', 'tomato', 'cheese'],
        createdAt: new Date(),
        imageUrl: 'https://picsum.photos/600/400?2',
        model: 'gemini-2.5-flash',
        recipeId: 2,
        status: AIGenerationStatus.SUCCESS,
        userId: 2,
      },
      {
        prompt: 'Analyze food image',
        detectedLabels: ['egg', 'bread', 'milk'],
        createdAt: new Date(),
        imageUrl: 'https://picsum.photos/600/400?3',
        model: 'gpt-4.1',
        recipeId: 3,
        status: AIGenerationStatus.PENDING,
        userId: 3,
      },
      {
        prompt: 'Generate vegan recipe',
        detectedLabels: ['broccoli', 'tofu'],
        createdAt: new Date(),
        imageUrl: 'https://picsum.photos/600/400?4',
        model: 'gemini-2.5-flash',
        recipeId: 3,
        status: AIGenerationStatus.FAILED,
        userId: 1,
      },
      {
        prompt: 'Generate dessert recipe',
        detectedLabels: ['cake', 'chocolate'],
        createdAt: new Date(),
        imageUrl: 'https://picsum.photos/600/400?5',
        model: 'gpt-4.1',
        recipeId: 2,
        status: AIGenerationStatus.SUCCESS,
        userId: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.searchHistory.createMany({
    data: [
      {
        keyword: 'chicken',
        createdAt: new Date(),
        userId: 1,
      },
      {
        keyword: 'healthy salad',
        createdAt: new Date(),
        userId: 1,
      },
      {
        keyword: 'pasta',
        createdAt: new Date(),
        userId: 2,
      },
      {
        keyword: 'vegetarian',
        createdAt: new Date(),
        userId: 2,
      },
      {
        keyword: 'cake',
        createdAt: new Date(),
        userId: 3,
      },
      {
        keyword: 'fried rice',
        createdAt: new Date(),
        userId: 3,
      },
      {
        keyword: 'soup',
        createdAt: new Date(),
        userId: 1,
      },
      {
        keyword: 'beef',
        createdAt: new Date(),
        userId: 2,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ AI data seeded');
}
