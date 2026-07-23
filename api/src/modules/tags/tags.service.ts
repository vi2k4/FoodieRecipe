import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeObj(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(val => this.serializeObj(val));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeObj(obj[key]);
      }
      return res;
    }
    return obj;
  }

  async findAll() {
    const tags = await this.prisma.tag.findMany();
    return this.serializeObj(tags);
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Tag already exists');
    }
    const id = BigInt(Date.now());
    const tag = await this.prisma.tag.create({
      data: {
        id,
        name: dto.name,
      },
    });
    return this.serializeObj(tag);
  }

  async remove(id: bigint) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.prisma.recipeTag.deleteMany({ where: { tagId: id } });
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }
}
