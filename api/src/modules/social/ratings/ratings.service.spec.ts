import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RatingsService', () => {
  let service: RatingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    recipe: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    rating: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rateRecipe', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(
        service.rateRecipe(1n, 2n, { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should upsert rating and update averageRating', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.rating.upsert.mockResolvedValue({});
      mockPrismaService.rating.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrismaService.recipe.update.mockResolvedValue({});

      const result = await service.rateRecipe(1n, 2n, { rating: 5 });
      expect(result).toEqual({ message: 'Recipe rated successfully', rating: 5 });
      expect(mockPrismaService.rating.upsert).toHaveBeenCalled();
      expect(mockPrismaService.rating.aggregate).toHaveBeenCalled();
      expect(mockPrismaService.recipe.update).toHaveBeenCalledWith({
        where: { id: 2n },
        data: { averageRating: 4.5 },
      });
    });
  });

  describe('updateRating', () => {
    it('should throw NotFoundException if rating does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.rating.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRating(1n, 2n, { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update rating and update averageRating', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.rating.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n, rating: 5 });
      mockPrismaService.rating.update.mockResolvedValue({});
      mockPrismaService.rating.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockPrismaService.recipe.update.mockResolvedValue({});

      const result = await service.updateRating(1n, 2n, { rating: 4 });
      expect(result).toEqual({ message: 'Rating updated successfully', rating: 4 });
      expect(mockPrismaService.rating.update).toHaveBeenCalled();
      expect(mockPrismaService.recipe.update).toHaveBeenCalledWith({
        where: { id: 2n },
        data: { averageRating: 4.0 },
      });
    });
  });

  describe('deleteRating', () => {
    it('should throw NotFoundException if rating does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.rating.findUnique.mockResolvedValue(null);

      await expect(service.deleteRating(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should delete rating and recalculate averageRating', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.rating.findUnique.mockResolvedValue({ userId: 1n, recipeId: 2n });
      mockPrismaService.rating.delete.mockResolvedValue({});
      mockPrismaService.rating.aggregate.mockResolvedValue({ _avg: { rating: 0 } });
      mockPrismaService.recipe.update.mockResolvedValue({});

      const result = await service.deleteRating(1n, 2n);
      expect(result).toEqual({ message: 'Rating deleted successfully' });
      expect(mockPrismaService.rating.delete).toHaveBeenCalled();
      expect(mockPrismaService.recipe.update).toHaveBeenCalledWith({
        where: { id: 2n },
        data: { averageRating: 0 },
      });
    });
  });
});
