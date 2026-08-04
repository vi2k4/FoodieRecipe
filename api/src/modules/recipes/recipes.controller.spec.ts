/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

describe('RecipesController (Unit Tests)', () => {
  let controller: RecipesController;
  let service: any;

  const mockRecipesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    incrementViewCount: jest.fn(),
    addIngredient: jest.fn(),
    updateIngredient: jest.fn(),
    removeIngredient: jest.fn(),
    addStep: jest.fn(),
    updateStep: jest.fn(),
    removeStep: jest.fn(),
    addImage: jest.fn(),
    removeImage: jest.fn(),
    addTagToRecipe: jest.fn(),
    removeTagFromRecipe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockRecipesService,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get(RecipesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Recipe CRUD
  it('findAll should call service.findAll', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    const res = await controller.findAll({ page: 1, limit: 10 });
    expect(res).toEqual({ data: [], total: 0 });
    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('findOne should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1', title: 'Phở' });
    const res = await controller.findOne('1');
    expect(res).toEqual({ id: '1', title: 'Phở' });
    expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
  });

  it('incrementViewCount should call service.incrementViewCount', async () => {
    service.incrementViewCount.mockResolvedValue(undefined);
    const res = await controller.incrementViewCount('1');
    expect(res).toEqual({ success: true });
    expect(service.incrementViewCount).toHaveBeenCalledWith(BigInt(1));
  });

  it('create should call service.create with extracted userId', async () => {
    const dto = { title: 'Bún Chả', userId: '2' };
    service.create.mockResolvedValue({ id: '2', title: 'Bún Chả' });
    const res = await controller.create({ id: 2 }, '', dto);
    expect(res).toEqual({ id: '2', title: 'Bún Chả' });
    expect(service.create).toHaveBeenCalledWith(BigInt(2), dto);
  });

  it('update should call service.update', async () => {
    const dto = { title: 'Bún Chả Hà Nội' };
    service.update.mockResolvedValue({ id: '2', title: 'Bún Chả Hà Nội' });
    const res = await controller.update('2', undefined, '2', dto);
    expect(res).toEqual({ id: '2', title: 'Bún Chả Hà Nội' });
    expect(service.update).toHaveBeenCalledWith(BigInt(2), BigInt(2), dto);
  });

  it('remove should call service.remove', async () => {
    service.remove.mockResolvedValue({ success: true });
    const res = await controller.remove('2', undefined, '2');
    expect(res).toEqual({ success: true });
    expect(service.remove).toHaveBeenCalledWith(BigInt(2), BigInt(2));
  });

  // Ingredient CRUD
  it('addIngredient should call service.addIngredient', async () => {
    const dto = { ingredientName: 'Thịt bò', userId: '2' };
    service.addIngredient.mockResolvedValue({
      id: '10',
      ingredientName: 'Thịt bò',
    });
    const res = await controller.addIngredient('1', undefined, '2', dto);
    expect(res).toEqual({ id: '10', ingredientName: 'Thịt bò' });
    expect(service.addIngredient).toHaveBeenCalledWith(
      BigInt(1),
      BigInt(2),
      dto,
    );
  });

  it('updateIngredient should call service.updateIngredient', async () => {
    const dto = { ingredientName: 'Thịt kobe' };
    service.updateIngredient.mockResolvedValue({
      id: '10',
      ingredientName: 'Thịt kobe',
    });
    const res = await controller.updateIngredient('10', undefined, '2', dto);
    expect(res).toEqual({ id: '10', ingredientName: 'Thịt kobe' });
    expect(service.updateIngredient).toHaveBeenCalledWith(
      BigInt(10),
      BigInt(2),
      dto,
    );
  });

  it('removeIngredient should call service.removeIngredient', async () => {
    service.removeIngredient.mockResolvedValue({ success: true });
    const res = await controller.removeIngredient('10', undefined, '2');
    expect(res).toEqual({ success: true });
    expect(service.removeIngredient).toHaveBeenCalledWith(
      BigInt(10),
      BigInt(2),
    );
  });

  // Step CRUD
  it('addStep should call service.addStep', async () => {
    const dto = { stepNumber: 1, content: 'Nấu nước dùng', userId: '2' };
    service.addStep.mockResolvedValue({ id: '20', content: 'Nấu nước dùng' });
    const res = await controller.addStep('1', undefined, '2', dto);
    expect(res).toEqual({ id: '20', content: 'Nấu nước dùng' });
    expect(service.addStep).toHaveBeenCalledWith(BigInt(1), BigInt(2), dto);
  });

  it('updateStep should call service.updateStep', async () => {
    const dto = { content: 'Ninh nước dùng 1h' };
    service.updateStep.mockResolvedValue({
      id: '20',
      content: 'Ninh nước dùng 1h',
    });
    const res = await controller.updateStep('20', undefined, '2', dto);
    expect(res).toEqual({ id: '20', content: 'Ninh nước dùng 1h' });
    expect(service.updateStep).toHaveBeenCalledWith(BigInt(20), BigInt(2), dto);
  });

  it('removeStep should call service.removeStep', async () => {
    service.removeStep.mockResolvedValue({ success: true });
    const res = await controller.removeStep('20', undefined, '2');
    expect(res).toEqual({ success: true });
    expect(service.removeStep).toHaveBeenCalledWith(BigInt(20), BigInt(2));
  });

  // Image CRUD
  it('addImage should call service.addImage', async () => {
    const dto = { imageUrl: 'https://example.com/img.jpg', userId: '2' };
    service.addImage.mockResolvedValue({
      id: '30',
      imageUrl: 'https://example.com/img.jpg',
    });
    const res = await controller.addImage('1', undefined, '2', dto);
    expect(res).toEqual({ id: '30', imageUrl: 'https://example.com/img.jpg' });
    expect(service.addImage).toHaveBeenCalledWith(BigInt(1), BigInt(2), dto);
  });

  it('removeImage should call service.removeImage', async () => {
    service.removeImage.mockResolvedValue({ success: true });
    const res = await controller.removeImage('30', undefined, '2');
    expect(res).toEqual({ success: true });
    expect(service.removeImage).toHaveBeenCalledWith(BigInt(30), BigInt(2));
  });
});
