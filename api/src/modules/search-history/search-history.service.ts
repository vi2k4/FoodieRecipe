import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: bigint, rawKeyword: string) {
    const keyword = rawKeyword.trim();
    if (!keyword) {
      throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
    }

    const [, history] = await this.prisma.$transaction([
      this.prisma.searchHistory.deleteMany({
        where: {
          userId,
          keyword: { equals: keyword, mode: 'insensitive' },
        },
      }),
      this.prisma.searchHistory.create({ data: { userId, keyword } }),
    ]);

    return this.serialize(history);
  }

  async findAll(userId: bigint, requestedLimit?: string) {
    const parsedLimit = Number(requestedLimit ?? 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 20)
      : 10;

    const histories = await this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return histories.map((history) => this.serialize(history));
  }

  async remove(userId: bigint, id: bigint) {
    const history = await this.prisma.searchHistory.findFirst({
      where: { id, userId },
    });
    if (!history) {
      throw new NotFoundException('Không tìm thấy lịch sử tìm kiếm');
    }

    await this.prisma.searchHistory.delete({ where: { id } });
    return { success: true };
  }

  async clear(userId: bigint) {
    const result = await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
    return { success: true, deletedCount: result.count };
  }

  private serialize(history: {
    id: bigint;
    userId: bigint | null;
    keyword: string;
    createdAt: Date;
  }) {
    return {
      id: history.id.toString(),
      userId: history.userId?.toString() ?? null,
      keyword: history.keyword,
      createdAt: history.createdAt,
    };
  }
}
