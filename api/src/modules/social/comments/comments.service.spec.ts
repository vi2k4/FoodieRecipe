import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { NotificationsService } from '../notifications/notifications.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    recipe: {
      findUnique: jest.fn(),
    },
    comment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
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

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should throw NotFoundException if recipe does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(1n, 2n, { content: 'test comment' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parent comment does not exist', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(1n, 2n, { content: 'test comment' }, 10n),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if parent comment is from another recipe', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.comment.findUnique.mockResolvedValue({ id: 10n, recipeId: 99n });

      await expect(
        service.createComment(1n, 2n, { content: 'test comment' }, 10n),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create comment successfully', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n, userId: 1n, title: 'Recipe' });
      mockPrismaService.comment.create.mockResolvedValue({ id: 100n, content: 'test comment', user: { username: 'testuser' } });

      const result = await service.createComment(1n, 2n, { content: 'test comment' });
      expect(result).toEqual({ id: 100n, content: 'test comment', user: { username: 'testuser' } });
    });
  });

  describe('getCommentsTree', () => {
    it('should return comments organized as a tree structure', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.comment.count
        .mockResolvedValueOnce(3) // totalComments (all non-deleted)
        .mockResolvedValueOnce(2); // totalRoots (root comments)
      const rootComments = [
        { id: 1n, content: 'root 1', parentCommentId: null, user: {} },
        { id: 3n, content: 'root 2', parentCommentId: null, user: {} },
      ];
      const childComments = [
        { id: 2n, content: 'child of 1', parentCommentId: 1n, user: {} },
      ];
      mockPrismaService.comment.findMany
        .mockResolvedValueOnce(rootComments)
        .mockResolvedValueOnce(childComments);

      const res = await service.getCommentsTree(2n);
      expect(res.meta.total).toBe(3);
      expect(res.meta.totalRoots).toBe(2);
      expect(res.data).toHaveLength(2);
      expect(res.data[0].id).toBe(1n);
      expect(res.data[0].replies).toHaveLength(1);
      expect(res.data[0].replies[0].id).toBe(2n);
      expect(res.data[1].id).toBe(3n);
    });
  });

  describe('updateComment', () => {
    it('should throw ForbiddenException if user is not the comment author', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue({ id: 100n, userId: 99n });

      await expect(
        service.updateComment(1n, 100n, { content: 'new content' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update and return the comment if owner requests', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue({ id: 100n, userId: 1n });
      mockPrismaService.comment.update.mockResolvedValue({ id: 100n, content: 'new content' });

      const result = await service.updateComment(1n, 100n, { content: 'new content' });
      expect(result).toEqual({ id: 100n, content: 'new content' });
    });
  });

  describe('deleteComment', () => {
    it('should throw ForbiddenException if user is not author', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue({ id: 100n, userId: 99n });

      await expect(service.deleteComment(1n, 100n)).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete by setting deletedAt date', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue({ id: 100n, userId: 1n });
      mockPrismaService.comment.update.mockResolvedValue({});

      const result = await service.deleteComment(1n, 100n);
      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: 100n },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
