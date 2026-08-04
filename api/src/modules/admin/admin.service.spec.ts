import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1n,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hash',
    avatarUrl: null,
    bio: null,
    role: 'USER' as any,
    isVerified: true,
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRecipe = {
    id: 1n,
    title: 'Test Recipe',
    userId: 2n,
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn().mockResolvedValue([mockUser]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue({ ...mockUser, isLocked: true }),
    },
    recipe: {
      findMany: jest.fn().mockResolvedValue([mockRecipe]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue(mockRecipe),
      update: jest.fn().mockResolvedValue({ ...mockRecipe, deletedAt: new Date() }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return a paginated list of users', async () => {
      const result = await service.getUsers('test', 1, 10);
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('toggleUserLock', () => {
    it('should toggle user lock state', async () => {
      const result = await service.toggleUserLock(1n, true);
      expect(result.isLocked).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { isLocked: true },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.toggleUserLock(999n, true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user by setting deletedAt', async () => {
      const deletedUserMock = { ...mockUser, deletedAt: new Date() };
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(deletedUserMock);

      const result = await service.deleteUser(1n);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('getRecipes', () => {
    it('should return a list of recipes', async () => {
      const result = await service.getRecipes('recipe', 1, 10);
      expect(result.data).toEqual([mockRecipe]);
      expect(prisma.recipe.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteRecipe', () => {
    it('should soft delete recipe', async () => {
      const result = await service.deleteRecipe(1n);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(prisma.recipe.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
