import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '../../generated/prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockNotification = {
    id: 1n,
    userId: 2n,
    title: 'Test Notification',
    content: 'This is a test notification',
    type: NotificationType.SYSTEM,
    referenceId: null,
    isRead: false,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    notification: {
      findMany: jest.fn().mockResolvedValue([mockNotification]),
      findFirst: jest.fn().mockResolvedValue(mockNotification),
      update: jest.fn().mockResolvedValue({ ...mockNotification, isRead: true }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue(mockNotification),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const result = await service.findAll(2n);
      expect(result).toEqual([mockNotification]);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 2n },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await service.markAsRead(1n, 2n);
      expect(result.isRead).toBe(true);
      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: { id: 1n, userId: 2n },
      });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { isRead: true },
      });
    });

    it('should throw NotFoundException if notification is not found', async () => {
      jest.spyOn(prisma.notification, 'findFirst').mockResolvedValueOnce(null);
      await expect(service.markAsRead(999n, 2n)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      const result = await service.markAllAsRead(2n);
      expect(result).toEqual({ success: true });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 2n, isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const result = await service.createNotification(
        2n,
        'Test',
        'Content',
        NotificationType.SYSTEM,
      );
      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
