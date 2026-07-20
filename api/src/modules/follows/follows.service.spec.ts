import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FollowsService', () => {
  let service: FollowsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    userFollow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('followUser', () => {
    it('should throw BadRequestException if user tries to follow themselves', async () => {
      await expect(service.followUser(1n, 1n)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if target user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.followUser(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should return message if already following', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.userFollow.findUnique.mockResolvedValue({ followerId: 1n, followingId: 2n });

      const result = await service.followUser(1n, 2n);
      expect(result).toEqual({ message: 'You are already following this user', followed: true });
      expect(mockPrismaService.userFollow.create).not.toHaveBeenCalled();
    });

    it('should follow user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.userFollow.findUnique.mockResolvedValue(null);
      mockPrismaService.userFollow.create.mockResolvedValue({});

      const result = await service.followUser(1n, 2n);
      expect(result).toEqual({ message: 'User followed successfully', followed: true });
      expect(mockPrismaService.userFollow.create).toHaveBeenCalledWith({
        data: { followerId: 1n, followingId: 2n },
      });
    });
  });

  describe('unfollowUser', () => {
    it('should throw NotFoundException if target user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.unfollowUser(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not following target user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.userFollow.findUnique.mockResolvedValue(null);

      await expect(service.unfollowUser(1n, 2n)).rejects.toThrow(NotFoundException);
    });

    it('should unfollow user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2n });
      mockPrismaService.userFollow.findUnique.mockResolvedValue({ followerId: 1n, followingId: 2n });
      mockPrismaService.userFollow.delete.mockResolvedValue({});

      const result = await service.unfollowUser(1n, 2n);
      expect(result).toEqual({ message: 'User unfollowed successfully', followed: false });
      expect(mockPrismaService.userFollow.delete).toHaveBeenCalled();
    });
  });

  describe('getFollowing', () => {
    it('should return list of following users', async () => {
      const mockFollows = [
        {
          following: { id: 2n, username: 'test_user' },
        },
      ];
      mockPrismaService.userFollow.findMany.mockResolvedValue(mockFollows);

      const result = await service.getFollowing(1n);
      expect(result).toEqual([{ id: 2n, username: 'test_user' }]);
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const mockFollows = [
        {
          follower: { id: 3n, username: 'follower_user' },
        },
      ];
      mockPrismaService.userFollow.findMany.mockResolvedValue(mockFollows);

      const result = await service.getFollowers(1n);
      expect(result).toEqual([{ id: 3n, username: 'follower_user' }]);
    });
  });
});
