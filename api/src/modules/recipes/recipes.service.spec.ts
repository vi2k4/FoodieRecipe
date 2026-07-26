/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RecipesService (Unit Tests)', () => {
  let service: RecipesService;
  let prisma: any;

  const mockPrismaService = {
    recipe: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    recipeIngredient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recipeStep: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recipeImage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    recipeTag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    recipeCategory: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // 1. CRUD RECIPE
  // ==========================================
  describe('CRUD Recipe', () => {
    describe('create (CREATE Recipe)', () => {
      it('should create a new recipe for user', async () => {
        const dto = { title: 'Phở Bò', description: 'Món nước', servings: 4 };
        const dummyRecipe = {
          id: BigInt(100),
          userId: BigInt(1),
          ...dto,
          isPublic: true,
        };
        prisma.recipe.create.mockResolvedValue(dummyRecipe);

        const res = await service.create(BigInt(1), dto);
        expect(res.title).toEqual('Phở Bò');
        expect(prisma.recipe.create).toHaveBeenCalled();
      });
    });

    describe('findAll (READ Recipe List)', () => {
      it('should return paginated recipes filtering deletedAt: null', async () => {
        const dummyRecipes = [
          { id: BigInt(1), title: 'Phở Bò', userId: BigInt(1) },
        ];
        prisma.recipe.findMany.mockResolvedValue(dummyRecipes);
        prisma.recipe.count.mockResolvedValue(1);

        const res = await service.findAll({ page: 1, limit: 10 });
        expect(res.data).toHaveLength(1);
        expect(res.total).toEqual(1);
        expect(prisma.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ deletedAt: null }),
          }),
        );
      });
    });

    describe('findOne (READ Recipe Detail)', () => {
      it('should return recipe detail with ingredients, steps, images, and tags', async () => {
        const dummyRecipe = {
          id: BigInt(1),
          title: 'Phở Bò',
          userId: BigInt(1),
        };
        prisma.recipe.findFirst.mockResolvedValue(dummyRecipe);
        prisma.recipeIngredient.findMany.mockResolvedValue([
          { id: BigInt(10), ingredientName: 'Bánh phở' },
        ]);
        prisma.recipeStep.findMany.mockResolvedValue([
          { id: BigInt(20), content: 'Trần bánh phở' },
        ]);
        prisma.recipeImage.findMany.mockResolvedValue([
          { id: BigInt(30), imageUrl: 'pho.jpg' },
        ]);
        prisma.recipeTag.findMany.mockResolvedValue([
          { recipeId: BigInt(1), tagId: BigInt(5) },
        ]);
        prisma.tag.findMany.mockResolvedValue([
          { id: BigInt(5), name: 'Ăn sáng' },
        ]);

        const res = await service.findOne(BigInt(1));
        expect(res.title).toEqual('Phở Bò');
        expect(res.ingredients).toHaveLength(1);
        expect(res.steps).toHaveLength(1);
        expect(res.images).toHaveLength(1);
        expect(res.tags).toHaveLength(1);
      });

      it('should throw NotFoundException if recipe is not found or soft deleted', async () => {
        prisma.recipe.findFirst.mockResolvedValue(null);
        await expect(service.findOne(BigInt(999))).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('update (UPDATE Recipe)', () => {
      it('should update recipe if user is the owner', async () => {
        const dummyRecipe = {
          id: BigInt(1),
          userId: BigInt(2),
          title: 'Phở Bò',
        };
        prisma.recipe.findFirst.mockResolvedValue(dummyRecipe);
        prisma.user.findUnique.mockResolvedValue({
          id: BigInt(2),
          role: 'USER',
        });
        prisma.recipe.update.mockResolvedValue({
          ...dummyRecipe,
          title: 'Phở Bò Tái',
        });

        const res = await service.update(BigInt(1), BigInt(2), {
          title: 'Phở Bò Tái',
        });
        expect(res.title).toEqual('Phở Bò Tái');
      });

      it('should throw ForbiddenException if user is not the owner nor admin', async () => {
        const dummyRecipe = {
          id: BigInt(1),
          userId: BigInt(2),
          title: 'Phở Bò',
        };
        prisma.recipe.findFirst.mockResolvedValue(dummyRecipe);
        prisma.user.findUnique.mockResolvedValue({
          id: BigInt(3),
          role: 'USER',
        });

        await expect(
          service.update(BigInt(1), BigInt(3), { title: 'Hack' }),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('remove (DELETE / Soft Delete Recipe)', () => {
      it('should update deletedAt timestamp on recipe when removing', async () => {
        const dummyRecipe = { id: BigInt(1), userId: BigInt(2) };
        prisma.recipe.findFirst.mockResolvedValue(dummyRecipe);
        prisma.user.findUnique.mockResolvedValue({
          id: BigInt(2),
          role: 'USER',
        });
        prisma.recipe.update.mockResolvedValue({
          ...dummyRecipe,
          deletedAt: new Date(),
        });

        const res = await service.remove(BigInt(1), BigInt(2));
        expect(res.success).toBe(true);
        expect(prisma.recipe.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: BigInt(1) },
            data: expect.objectContaining({ deletedAt: expect.any(Date) }),
          }),
        );
      });
    });
  });

  // ==========================================
  // 2. CRUD INGREDIENT
  // ==========================================
  describe('CRUD Ingredient', () => {
    beforeEach(() => {
      prisma.recipe.findFirst.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      prisma.user.findUnique.mockResolvedValue({ id: BigInt(2), role: 'USER' });
    });

    it('addIngredient (CREATE) should add ingredient to recipe', async () => {
      const dto = { ingredientName: 'Thịt bò', quantity: 200, unit: 'g' };
      const createdIng = { id: BigInt(10), recipeId: BigInt(1), ...dto };
      prisma.recipeIngredient.create.mockResolvedValue(createdIng);

      const res = await service.addIngredient(BigInt(1), BigInt(2), dto);
      expect(res.ingredientName).toEqual('Thịt bò');
      expect(prisma.recipeIngredient.create).toHaveBeenCalled();
    });

    it('updateIngredient (UPDATE) should update ingredient details', async () => {
      prisma.recipeIngredient.findUnique.mockResolvedValue({
        id: BigInt(10),
        recipeId: BigInt(1),
      });
      prisma.recipeIngredient.update.mockResolvedValue({
        id: BigInt(10),
        ingredientName: 'Thịt bò kobe',
      });

      const res = await service.updateIngredient(BigInt(10), BigInt(2), {
        ingredientName: 'Thịt bò kobe',
      });
      expect(res.ingredientName).toEqual('Thịt bò kobe');
    });

    it('removeIngredient (DELETE) should remove ingredient from recipe', async () => {
      prisma.recipeIngredient.findUnique.mockResolvedValue({
        id: BigInt(10),
        recipeId: BigInt(1),
      });
      prisma.recipeIngredient.delete.mockResolvedValue({});

      const res = await service.removeIngredient(BigInt(10), BigInt(2));
      expect(res.success).toBe(true);
      expect(prisma.recipeIngredient.delete).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
      });
    });
  });

  // ==========================================
  // 3. CRUD STEP
  // ==========================================
  describe('CRUD Step', () => {
    beforeEach(() => {
      prisma.recipe.findFirst.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      prisma.user.findUnique.mockResolvedValue({ id: BigInt(2), role: 'USER' });
    });

    it('addStep (CREATE) should add cooking step to recipe', async () => {
      const dto = { stepNumber: 1, content: 'Sơ chế nguyên liệu' };
      const createdStep = { id: BigInt(20), recipeId: BigInt(1), ...dto };
      prisma.recipeStep.create.mockResolvedValue(createdStep);

      const res = await service.addStep(BigInt(1), BigInt(2), dto);
      expect(res.content).toEqual('Sơ chế nguyên liệu');
      expect(prisma.recipeStep.create).toHaveBeenCalled();
    });

    it('updateStep (UPDATE) should update cooking step content', async () => {
      prisma.recipeStep.findUnique.mockResolvedValue({
        id: BigInt(20),
        recipeId: BigInt(1),
      });
      prisma.recipeStep.update.mockResolvedValue({
        id: BigInt(20),
        content: 'Ninh xương 30 phút',
      });

      const res = await service.updateStep(BigInt(20), BigInt(2), {
        content: 'Ninh xương 30 phút',
      });
      expect(res.content).toEqual('Ninh xương 30 phút');
    });

    it('removeStep (DELETE) should remove step from recipe', async () => {
      prisma.recipeStep.findUnique.mockResolvedValue({
        id: BigInt(20),
        recipeId: BigInt(1),
      });
      prisma.recipeStep.delete.mockResolvedValue({});

      const res = await service.removeStep(BigInt(20), BigInt(2));
      expect(res.success).toBe(true);
      expect(prisma.recipeStep.delete).toHaveBeenCalledWith({
        where: { id: BigInt(20) },
      });
    });
  });

  // ==========================================
  // 4. CRUD IMAGE
  // ==========================================
  describe('CRUD Image', () => {
    beforeEach(() => {
      prisma.recipe.findFirst.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      prisma.user.findUnique.mockResolvedValue({ id: BigInt(2), role: 'USER' });
    });

    it('addImage (CREATE) should add image to recipe', async () => {
      const dto = { imageUrl: 'https://example.com/food.jpg' };
      const createdImg = { id: BigInt(30), recipeId: BigInt(1), ...dto };
      prisma.recipeImage.create.mockResolvedValue(createdImg);

      const res = await service.addImage(BigInt(1), BigInt(2), dto);
      expect(res.imageUrl).toEqual('https://example.com/food.jpg');
      expect(prisma.recipeImage.create).toHaveBeenCalled();
    });

    it('removeImage (DELETE) should remove image from recipe', async () => {
      prisma.recipeImage.findUnique.mockResolvedValue({
        id: BigInt(30),
        recipeId: BigInt(1),
      });
      prisma.recipeImage.delete.mockResolvedValue({});

      const res = await service.removeImage(BigInt(30), BigInt(2));
      expect(res.success).toBe(true);
      expect(prisma.recipeImage.delete).toHaveBeenCalledWith({
        where: { id: BigInt(30) },
      });
    });
  });
});
