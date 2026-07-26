import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('LikesService', () => {
  let service: LikesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    recipe: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    recipeLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('likeRecipe', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.likeRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 2n, deletedAt: null },
      });
    });

    it('should return message if already liked', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.recipeLike.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n });

      const result = await service.likeRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe already liked', liked: true });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should create like and increment likeCount', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.recipeLike.findUnique.mockResolvedValue(null);

      const result = await service.likeRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe liked successfully', liked: true });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('unlikeRecipe', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.unlikeRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not liked yet', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.recipeLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikeRecipe(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should delete like and decrement likeCount', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.recipeLike.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n });

      const result = await service.unlikeRecipe(1n, 2n);
      expect(result).toEqual({ message: 'Recipe unliked successfully', liked: false });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
