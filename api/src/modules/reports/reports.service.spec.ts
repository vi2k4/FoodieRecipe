import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportStatus, NotificationType } from '../../generated/prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;
  let notificationsService: NotificationsService;

  const mockUser = { id: 2n, username: 'recipe_author', email: 'author@test.com' };
  const mockRecipe = { id: 1n, title: 'Sample Recipe', userId: 2n, deletedAt: null };
  const mockReport = {
    id: 1n,
    recipeId: 1n,
    reporterId: 3n,
    reason: 'Spam',
    description: 'This is spam',
    status: ReportStatus.PENDING,
    handledBy: null,
    handledAt: null,
    createdAt: new Date(),
    recipe: mockRecipe,
  };

  const mockPrismaService = {
    recipe: {
      findUnique: jest.fn().mockResolvedValue(mockRecipe),
      update: jest.fn().mockResolvedValue({ ...mockRecipe, isPublic: false }),
    },
    report: {
      findUnique: jest.fn().mockResolvedValue(mockReport),
      create: jest.fn().mockResolvedValue(mockReport),
      findMany: jest.fn().mockResolvedValue([mockReport]),
      update: jest.fn().mockResolvedValue({ ...mockReport, status: ReportStatus.RESOLVED }),
    },
    user: {
      findMany: jest.fn().mockResolvedValue([{ id: 1n, role: 'ADMIN' }]),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({ id: 1n }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    it('should create a report and notify admin', async () => {
      // Mock no existing report
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValueOnce(null);

      const result = await service.createReport(1n, 3n, {
        reason: 'Spam',
        description: 'This is spam',
      });

      expect(result).toEqual(mockReport);
      expect(prisma.recipe.findUnique).toHaveBeenCalledWith({ where: { id: 1n } });
      expect(prisma.report.create).toHaveBeenCalled();
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });

    it('should throw BadRequestException if author reports own recipe', async () => {
      await expect(
        service.createReport(1n, 2n, { reason: 'Spam' }), // reporterId: 2n matches recipe author
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duplicate report', async () => {
      // Mock existing report
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValueOnce(mockReport);

      await expect(
        service.createReport(1n, 3n, { reason: 'Spam' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleReport', () => {
    it('should resolve a report, hide the recipe and notify author', async () => {
      const result = await service.handleReport(1n, 1n, {
        status: ReportStatus.RESOLVED,
      });

      expect(result.status).toBe(ReportStatus.RESOLVED);
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: expect.objectContaining({
          status: ReportStatus.RESOLVED,
          handledBy: 1n,
        }),
      });
      expect(prisma.recipe.update).toHaveBeenCalledWith({
        where: { id: mockReport.recipeId },
        data: { isPublic: false },
      });
      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        mockRecipe.userId,
        'Công thức của bạn đã bị ẩn',
        expect.stringContaining(mockRecipe.title),
        NotificationType.SYSTEM,
        mockRecipe.id,
      );
    });
  });
});
