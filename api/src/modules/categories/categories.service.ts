/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeObj(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map((val) => this.serializeObj(val));
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
    const categories = await this.prisma.recipeCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return this.serializeObj(categories);
  }

  async findOne(id: bigint) {
    const category = await this.prisma.recipeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.serializeObj(category);
  }

  async create(dto: CreateCategoryDto) {
    const id = BigInt(Date.now());

    const category = await this.prisma.recipeCategory.create({
      data: {
        id,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        createdAt: new Date(),
      },
    });
    return this.serializeObj(category);
  }

  async update(id: bigint, dto: UpdateCategoryDto) {
    await this.findOne(id); // Ensure it exists
    const category = await this.prisma.recipeCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
      },
    });
    return this.serializeObj(category);
  }

  async remove(id: bigint) {
    await this.findOne(id);
    await this.prisma.recipeCategory.delete({
      where: { id },
    });
    return { success: true };
  }
}
