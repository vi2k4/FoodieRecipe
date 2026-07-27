import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      count: jest.fn().mockResolvedValue(10),
    },
    recipe: {
      count: jest.fn().mockResolvedValue(20),
      findMany: jest.fn().mockResolvedValue([]),
    },
    comment: {
      count: jest.fn().mockResolvedValue(30),
    },
    recipeLike: {
      count: jest.fn().mockResolvedValue(40),
    },
    report: {
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aIGenerationHistory: {
      count: jest.fn().mockResolvedValue(50),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated counts', async () => {
      const stats = await service.getDashboardStats();
      expect(stats).toEqual({
        totalUsers: 10,
        totalRecipes: 20,
        totalComments: 30,
        totalLikes: 40,
        totalReports: 5,
        totalAiGenerations: 50,
      });
    });
  });

  describe('getHighlightedRecipes', () => {
    it('should query highlighted recipes', async () => {
      const result = await service.getHighlightedRecipes();
      expect(result).toEqual([]);
      expect(prisma.recipe.findMany).toHaveBeenCalled();
    });
  });

  describe('getPendingReports', () => {
    it('should query pending reports', async () => {
      const result = await service.getPendingReports();
      expect(result).toEqual([]);
      expect(prisma.report.findMany).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should compute statistics for last 7 days', async () => {
      const result = await service.getStatistics();
      expect(result.length).toBe(7);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('users');
      expect(result[0]).toHaveProperty('recipes');
    });
  });
});
