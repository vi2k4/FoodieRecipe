/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  CreateStepDto,
  UpdateStepDto,
  CreateImageDto,
} from './dto/sub-resources.dto';
import {
  RecipeDifficulty,
  RecipeImageType,
  Prisma,
} from '../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../common/storage/s3.service';

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  private getConfiguredS3Key(value?: string | null): string | null {
    if (!value) return null;

    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucket) return null;

    // New uploads are stored as S3 keys. Keep data URLs and other external
    // URLs untouched, but resolve our own keys to presigned URLs on reads.
    if (!/^https?:\/\//i.test(value)) {
      return value.startsWith('data:') ? null : value;
    }

    try {
      const url = new URL(value);
      const virtualHostedBucket = url.hostname.startsWith(`${bucket}.s3.`);
      const pathStyleBucket =
        url.hostname.startsWith('s3.') &&
        url.pathname.startsWith(`/${bucket}/`);

      if (virtualHostedBucket) {
        return decodeURIComponent(url.pathname.replace(/^\//, ''));
      }

      if (pathStyleBucket) {
        return decodeURIComponent(url.pathname.slice(bucket.length + 2));
      }
    } catch {
      return null;
    }

    return null;
  }

  private normalizeStoredImage(value?: string | null) {
    const key = this.getConfiguredS3Key(value);
    return key ?? value;
  }

  private async resolveImageUrl(value?: string | null) {
    const key = this.getConfiguredS3Key(value);
    return key ? this.s3Service.getPresignedUrl(key) : value;
  }

  private async resolveRecipeImages<T extends Record<string, any>>(
    recipe: T,
  ): Promise<T> {
    const resolved: Record<string, any> = { ...recipe };
    resolved.thumbnail = await this.resolveImageUrl(recipe.thumbnail);

    if (Array.isArray(recipe.images)) {
      resolved.images = await Promise.all(
        recipe.images.map(async (image: Record<string, any>) => ({
          ...image,
          imageUrl: await this.resolveImageUrl(image.imageUrl),
        })),
      );
    }

    return resolved as T;
  }

  private serializeObj(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (typeof obj === 'object') {
      if (typeof obj.toNumber === 'function') return obj.toNumber();
      if ('d' in obj && Array.isArray(obj.d)) return obj.d[0] ?? 0;
      if (obj instanceof Date) return obj.toISOString();
      if (Array.isArray(obj)) return obj.map((val) => this.serializeObj(val));
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeObj(obj[key]);
      }
      return res;
    }
    return obj;
  }

  async findAll(
    query: QueryRecipeDto & { userId?: number | string | bigint },
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      difficulty,
      isPublic,
      userId,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { deletedAt: null };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }
    if (difficulty) {
      where.difficulty = difficulty as RecipeDifficulty;
    }
    if (!userId) {
      // Public recipe endpoints must never expose private recipes.
      where.isPublic = true;
    } else if (isPublic !== undefined) {
      const pub = String(isPublic).toLowerCase() === 'true';
      where.isPublic = pub;
    }
    if (userId) {
      where.userId = BigInt(userId);
    }

    const [data, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, email: true },
          },
          category: {
            select: { id: true, name: true, icon: true },
          },
          _count: {
            select: {
              comments: { where: { deletedAt: null } },
              likes: true,
              favorites: true,
            },
          },
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    const resolvedData = await Promise.all(
      data.map((recipe) => this.resolveRecipeImages(recipe)),
    );

    return {
      data: this.serializeObj(resolvedData),
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }

  async findOne(id: bigint) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        _count: {
          select: {
            comments: { where: { deletedAt: null } },
            likes: true,
            favorites: true,
          },
        },
      },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const [ingredients, steps, images, tags] = await Promise.all([
      this.prisma.recipeIngredient.findMany({
        where: { recipeId: id },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.recipeStep.findMany({
        where: { recipeId: id },
        orderBy: { stepNumber: 'asc' },
      }),
      this.prisma.recipeImage.findMany({
        where: { recipeId: id },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.recipeTag.findMany({
        where: { recipeId: id },
      }),
    ]);

    // Manually fetch tags if there is no relation explicitly defined
    const tagIds = tags.map((t) => t.tagId);
    let fullTags: any[] = [];
    if (tagIds.length > 0) {
      fullTags = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });
    }

    const resolvedRecipe = await this.resolveRecipeImages({
      ...recipe,
      ingredients,
      steps,
      images,
      tags: fullTags,
    });

    return this.serializeObj(resolvedRecipe);
  }

  async create(userId: bigint, dto: CreateRecipeDto) {
    if (
      dto.calories !== undefined &&
      dto.calories !== null &&
      Number(dto.calories) < 0
    ) {
      throw new BadRequestException('Số lượng calo không được là số âm!');
    }
    if (
      dto.cookTime !== undefined &&
      dto.cookTime !== null &&
      Number(dto.cookTime) < 0
    ) {
      throw new BadRequestException('Thời gian nấu không được là số âm!');
    }
    if (
      dto.servings !== undefined &&
      dto.servings !== null &&
      Number(dto.servings) < 1
    ) {
      throw new BadRequestException('Khẩu phần ăn phải lớn hơn hoặc bằng 1!');
    }

    const recipe = await this.prisma.recipe.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId ? BigInt(dto.categoryId) : null,
        calories: dto.calories ? Math.max(0, Number(dto.calories)) : null,
        cookTime: dto.cookTime ? Math.max(0, Number(dto.cookTime)) : null,
        difficulty: (dto.difficulty as RecipeDifficulty) || 'EASY',
        servings: dto.servings ? Math.max(1, Number(dto.servings)) : 4,
        thumbnail: this.normalizeStoredImage(dto.thumbnail),
        source: dto.source,
        isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
      },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
    return this.serializeObj(await this.resolveRecipeImages(recipe));
  }

  async update(id: bigint, userId: bigint, dto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, deletedAt: null },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (recipe.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa công thức này!',
      );
    }

    if (
      dto.calories !== undefined &&
      dto.calories !== null &&
      Number(dto.calories) < 0
    ) {
      throw new BadRequestException('Số lượng calo không được là số âm!');
    }
    if (
      dto.cookTime !== undefined &&
      dto.cookTime !== null &&
      Number(dto.cookTime) < 0
    ) {
      throw new BadRequestException('Thời gian nấu không được là số âm!');
    }
    if (
      dto.servings !== undefined &&
      dto.servings !== null &&
      Number(dto.servings) < 1
    ) {
      throw new BadRequestException('Khẩu phần ăn phải lớn hơn hoặc bằng 1!');
    }

    const updated = await this.prisma.recipe.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId ? BigInt(dto.categoryId) : undefined,
        calories:
          dto.calories !== undefined
            ? dto.calories
              ? Math.max(0, Number(dto.calories))
              : null
            : undefined,
        cookTime:
          dto.cookTime !== undefined
            ? dto.cookTime
              ? Math.max(0, Number(dto.cookTime))
              : null
            : undefined,
        difficulty: dto.difficulty as RecipeDifficulty,
        servings:
          dto.servings !== undefined
            ? dto.servings
              ? Math.max(1, Number(dto.servings))
              : 4
            : undefined,
        thumbnail: this.normalizeStoredImage(dto.thumbnail),
        source: dto.source,
        isPublic: dto.isPublic,
      },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
    return this.serializeObj(await this.resolveRecipeImages(updated));
  }

  async remove(id: bigint, userId: bigint) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, deletedAt: null },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (recipe.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa công thức này!');
    }

    // Soft delete: update deletedAt field with current timestamp (Timestamptz)
    await this.prisma.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Recipe soft-deleted successfully' };
  }

  async incrementViewCount(id: bigint) {
    await this.prisma.recipe.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // --- Sub resources ---

  async addIngredient(
    recipeId: bigint,
    userId: bigint,
    dto: CreateIngredientDto,
  ) {
    await this.checkOwnership(recipeId, userId);
    const id = BigInt(Date.now());
    const ingredient = await this.prisma.recipeIngredient.create({
      data: {
        id,
        recipeId,
        ingredientName: dto.ingredientName,
        quantity: dto.quantity,
        unit: dto.unit,
        displayOrder: dto.displayOrder || 1,
      },
    });
    return this.serializeObj(ingredient);
  }

  async updateIngredient(id: bigint, userId: bigint, dto: UpdateIngredientDto) {
    const ingredient = await this.prisma.recipeIngredient.findUnique({
      where: { id },
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    await this.checkOwnership(ingredient.recipeId, userId);

    const updated = await this.prisma.recipeIngredient.update({
      where: { id },
      data: {
        ingredientName: dto.ingredientName,
        quantity: dto.quantity,
        unit: dto.unit,
        displayOrder: dto.displayOrder,
      },
    });
    return this.serializeObj(updated);
  }

  async removeIngredient(id: bigint, userId: bigint) {
    const ingredient = await this.prisma.recipeIngredient.findUnique({
      where: { id },
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    await this.checkOwnership(ingredient.recipeId, userId);

    await this.prisma.recipeIngredient.delete({ where: { id } });
    return { success: true };
  }

  async addStep(recipeId: bigint, userId: bigint, dto: CreateStepDto) {
    await this.checkOwnership(recipeId, userId);

    // Find highest current stepNumber for this recipe to prevent unique constraint collision
    const maxStep = await this.prisma.recipeStep.findFirst({
      where: { recipeId },
      orderBy: { stepNumber: 'desc' },
      select: { stepNumber: true },
    });

    const nextStepNumber = dto.stepNumber ?? (maxStep?.stepNumber || 0) + 1;
    let finalStepNumber = nextStepNumber;

    if (dto.stepNumber !== undefined) {
      const existing = await this.prisma.recipeStep.findFirst({
        where: { recipeId, stepNumber: dto.stepNumber },
      });
      if (existing) {
        finalStepNumber = (maxStep?.stepNumber || 0) + 1;
      }
    }

    const id = BigInt(Date.now());
    const step = await this.prisma.recipeStep.create({
      data: {
        id,
        recipeId,
        stepNumber: finalStepNumber,
        content: dto.content,
      },
    });
    return this.serializeObj(step);
  }

  async updateStep(id: bigint, userId: bigint, dto: UpdateStepDto) {
    const step = await this.prisma.recipeStep.findUnique({ where: { id } });
    if (!step) throw new NotFoundException('Step not found');
    await this.checkOwnership(step.recipeId, userId);

    // If stepNumber is changing and another step already has that stepNumber, handle swap safely
    if (dto.stepNumber !== undefined && dto.stepNumber !== step.stepNumber) {
      const collidingStep = await this.prisma.recipeStep.findFirst({
        where: { recipeId: step.recipeId, stepNumber: dto.stepNumber },
      });

      if (collidingStep) {
        // Temporarily assign step.id a negative stepNumber to avoid unique constraint violation
        const tempStepNumber = -1000 - Math.floor(Math.random() * 9000);
        await this.prisma.recipeStep.update({
          where: { id },
          data: { stepNumber: tempStepNumber },
        });

        // Move colliding step to old step.stepNumber
        await this.prisma.recipeStep.update({
          where: { id: collidingStep.id },
          data: { stepNumber: step.stepNumber },
        });
      }
    }

    const updated = await this.prisma.recipeStep.update({
      where: { id },
      data: {
        stepNumber:
          dto.stepNumber !== undefined ? dto.stepNumber : step.stepNumber,
        content: dto.content !== undefined ? dto.content : step.content,
      },
    });
    return this.serializeObj(updated);
  }

  async removeStep(id: bigint, userId: bigint) {
    const step = await this.prisma.recipeStep.findUnique({ where: { id } });
    if (!step) throw new NotFoundException('Step not found');
    await this.checkOwnership(step.recipeId, userId);

    await this.prisma.recipeStep.delete({ where: { id } });
    return { success: true };
  }

  async addImage(recipeId: bigint, userId: bigint, dto: CreateImageDto) {
    await this.checkOwnership(recipeId, userId);
    const id = BigInt(Date.now());
    const image = await this.prisma.recipeImage.create({
      data: {
        id,
        recipeId,
        imageUrl: this.normalizeStoredImage(dto.imageUrl) ?? '',
        type: (dto.type as RecipeImageType) || 'OTHER',
        displayOrder: dto.displayOrder || 1,
        createdAt: new Date(),
      },
    });
    return this.serializeObj(image);
  }

  async removeImage(id: bigint, userId: bigint) {
    const image = await this.prisma.recipeImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    await this.checkOwnership(image.recipeId, userId);

    await this.prisma.recipeImage.delete({ where: { id } });
    return { success: true };
  }

  async addTagToRecipe(recipeId: bigint, tagId: bigint, userId: bigint) {
    await this.checkOwnership(recipeId, userId);
    const tag = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Tag not found');

    const existing = await this.prisma.recipeTag.findFirst({
      where: { recipeId, tagId },
    });
    if (existing) throw new ConflictException('Tag already added to recipe');

    await this.prisma.recipeTag.create({
      data: { recipeId, tagId },
    });
    return { success: true };
  }

  async removeTagFromRecipe(recipeId: bigint, tagId: bigint, userId: bigint) {
    await this.checkOwnership(recipeId, userId);
    // Since there's no unique identifier except compound id, and Prisma might use compound ID if specified.
    // If Prisma doesn't have an @id for RecipeTag, we delete using findMany or specific syntax.
    // Let's use deleteMany for safety.
    await this.prisma.recipeTag.deleteMany({
      where: { recipeId, tagId },
    });
    return { success: true };
  }

  private async checkOwnership(recipeId: bigint, userId: bigint) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (recipe.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Bạn không phải là chủ sở hữu của công thức này!',
      );
    }
  }
}
