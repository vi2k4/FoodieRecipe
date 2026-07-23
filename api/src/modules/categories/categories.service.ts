import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recipeCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, description?: string, icon?: string) {
    const existing = await this.prisma.recipeCategory.findUnique({
      where: { name },
    });
    if (existing) {
      throw new BadRequestException('Danh mục này đã tồn tại');
    }
    return this.prisma.recipeCategory.create({
      data: { name, description, icon },
    });
  }

  async update(id: bigint, name: string, description?: string, icon?: string) {
    const category = await this.prisma.recipeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const existingName = await this.prisma.recipeCategory.findFirst({
      where: { name, NOT: { id } },
    });
    if (existingName) {
      throw new BadRequestException('Tên danh mục này đã tồn tại');
    }

    return this.prisma.recipeCategory.update({
      where: { id },
      data: { name, description, icon },
    });
  }

  async delete(id: bigint) {
    const category = await this.prisma.recipeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return this.prisma.recipeCategory.delete({
      where: { id },
    });
  }
}
