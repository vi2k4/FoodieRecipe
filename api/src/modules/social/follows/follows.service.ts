import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async followUser(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // 1. Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId, deletedAt: null },
    });
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${followingId} not found`);
    }

    // 2. Check if already following
    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return { message: 'You are already following this user', followed: true };
    }

    // 3. Create follow
    await this.prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // 4. Create notification
    const follower = await this.prisma.user.findUnique({ where: { id: followerId } });
    await this.notificationsService.createNotification({
      userId: followingId,
      title: 'Người theo dõi mới',
      content: `${follower?.username || 'Một người dùng'} đã bắt đầu theo dõi bạn.`,
      type: NotificationType.FOLLOW,
    });

    return { message: 'User followed successfully', followed: true };
  }

  async unfollowUser(followerId: bigint, followingId: bigint) {
    // 1. Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId, deletedAt: null },
    });
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${followingId} not found`);
    }

    // 2. Check if follow relation exists
    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this user');
    }

    // 3. Delete follow
    await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'User unfollowed successfully', followed: false };
  }

  async getFollowing(userId: bigint) {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return follows.map((f) => f.following);
  }

  async getFollowers(userId: bigint) {
    const follows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return follows.map((f) => f.follower);
  }
}
