import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      include: {
        recipes: {
          where: {
            isPublic: true,
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
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

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User ${idOrUsername} not found`);
    }

    return user;
  }
}
