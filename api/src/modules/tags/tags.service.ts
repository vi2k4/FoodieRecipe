import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string) {
    const existing = await this.prisma.tag.findUnique({
      where: { name },
    });
    if (existing) {
      throw new BadRequestException('Thẻ này đã tồn tại');
    }
    return this.prisma.tag.create({
      data: { name },
    });
  }

  async update(id: bigint, name: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException('Không tìm thấy thẻ');
    }

    const existingName = await this.prisma.tag.findFirst({
      where: { name, NOT: { id } },
    });
    if (existingName) {
      throw new BadRequestException('Tên thẻ này đã tồn tại');
    }

    return this.prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: bigint) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException('Không tìm thấy thẻ');
    }
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
