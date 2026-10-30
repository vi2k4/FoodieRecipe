import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeObj(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object') {
      if (typeof value.toNumber === 'function') return value.toNumber();
      if (value instanceof Date) return value.toISOString();
      if (Array.isArray(value))
        return value.map((item) => this.serializeObj(item));
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          this.serializeObj(item),
        ]),
      );
    }
    return value;
  }

  async findAll() {
    return this.prisma.user.findMany({
      take: 10,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(idOrUsername: string) {
    const isId = !isNaN(Number(idOrUsername));
    const user = await this.prisma.user.findUnique({
      where: isId ? { id: BigInt(idOrUsername) } : { username: idOrUsername },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        recipes: {
          where: {
            isPublic: true,
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            calories: true,
            cookTime: true,
            difficulty: true,
            servings: true,
            thumbnail: true,
            viewCount: true,
            likeCount: true,
            averageRating: true,
            createdAt: true,
            category: { select: { id: true, name: true, icon: true } },
            _count: {
              select: {
                likes: true,
                comments: { where: { deletedAt: null } },
                favorites: true,
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${idOrUsername} not found`);
    }

    return this.serializeObj(user);
  }
}
