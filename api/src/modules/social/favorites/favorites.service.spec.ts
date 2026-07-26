import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    recipe: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    favorite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('favoriteRecipe', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.favoriteRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should return message if already favorited', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.favorite.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n });

      const result = await service.favoriteRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe already in favorites', favorited: true });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should add to favorites and increment count', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.favorite.findUnique.mockResolvedValue(null);

      const result = await service.favoriteRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe added to favorites successfully', favorited: true });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('unfavoriteRecipe', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.unfavoriteRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not favorited yet', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.favorite.findUnique.mockResolvedValue(null);

      await expect(service.unfavoriteRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should remove from favorites and decrement count', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.favorite.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n });

      const result = await service.unfavoriteRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe removed from favorites successfully', favorited: false });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('getFavorites', () => {
    it('should return list of user favorite recipes', async () => {
      const mockFavs = [
        {
          recipe: { id: 2n, title: 'Test Recipe' },
        },
      ];
      mockPrismaService.favorite.findMany.mockResolvedValue(mockFavs);

      const result = await service.getFavorites(1n);
      expect(result).toEqual([{ id: 2n, title: 'Test Recipe' }]);
      expect(mockPrismaService.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 1n },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
