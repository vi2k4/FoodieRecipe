/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;

  const mockPrismaService = {
    recipeCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (READ)', () => {
    it('should return an array of categories', async () => {
      const dummyCats = [
        { id: BigInt(1), name: 'Món Chay', description: 'Đồ chay', icon: '🥗' },
      ];
      prisma.recipeCategory.findMany.mockResolvedValue(dummyCats);

      const result = await service.findAll();
      expect(result).toEqual([
        { id: '1', name: 'Món Chay', description: 'Đồ chay', icon: '🥗' },
      ]);
      expect(prisma.recipeCategory.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne (READ)', () => {
    it('should return a category by id', async () => {
      const dummyCat = { id: BigInt(1), name: 'Món Chay', icon: '🥗' };
      prisma.recipeCategory.findUnique.mockResolvedValue(dummyCat);

      const result = await service.findOne(BigInt(1));
      expect(result).toEqual({ id: '1', name: 'Món Chay', icon: '🥗' });
      expect(prisma.recipeCategory.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      prisma.recipeCategory.findUnique.mockResolvedValue(null);

      await expect(service.findOne(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create (CREATE)', () => {
    it('should create a new category', async () => {
      const dto = {
        name: 'Món Việt',
        description: 'Món truyền thống',
        icon: '🍲',
      };
      const created = { id: BigInt(12345), ...dto };
      prisma.recipeCategory.create.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result.name).toEqual('Món Việt');
      expect(prisma.recipeCategory.create).toHaveBeenCalled();
    });
  });

  describe('update (UPDATE)', () => {
    it('should update an existing category', async () => {
      const dummyCat = { id: BigInt(1), name: 'Món Chay' };
      prisma.recipeCategory.findUnique.mockResolvedValue(dummyCat);
      const updatedCat = { id: BigInt(1), name: 'Món Chay Cập Nhật' };
      prisma.recipeCategory.update.mockResolvedValue(updatedCat);

      const result = await service.update(BigInt(1), {
        name: 'Món Chay Cập Nhật',
      });
      expect(result.name).toEqual('Món Chay Cập Nhật');
    });
  });

  describe('remove (DELETE)', () => {
    it('should delete a category', async () => {
      const dummyCat = { id: BigInt(1), name: 'Món Chay' };
      prisma.recipeCategory.findUnique.mockResolvedValue(dummyCat);
      prisma.recipeCategory.delete.mockResolvedValue(dummyCat);

      const result = await service.remove(BigInt(1));
      expect(result).toEqual({ success: true });
      expect(prisma.recipeCategory.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });
  });
});
