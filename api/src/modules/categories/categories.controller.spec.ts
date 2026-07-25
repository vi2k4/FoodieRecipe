/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: any;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service', async () => {
    service.findAll.mockResolvedValue([{ id: '1', name: 'Món Việt' }]);
    const res = await controller.findAll();
    expect(res).toEqual([{ id: '1', name: 'Món Việt' }]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should delegate to service', async () => {
    service.findOne.mockResolvedValue({ id: '1', name: 'Món Việt' });
    const res = await controller.findOne('1');
    expect(res).toEqual({ id: '1', name: 'Món Việt' });
    expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
  });

  it('create should delegate to service', async () => {
    const dto = { name: 'Món Việt' };
    service.create.mockResolvedValue({ id: '1', name: 'Món Việt' });
    const res = await controller.create(dto);
    expect(res).toEqual({ id: '1', name: 'Món Việt' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update should delegate to service', async () => {
    const dto = { name: 'Món Việt Mới' };
    service.update.mockResolvedValue({ id: '1', name: 'Món Việt Mới' });
    const res = await controller.update('1', dto);
    expect(res).toEqual({ id: '1', name: 'Món Việt Mới' });
    expect(service.update).toHaveBeenCalledWith(BigInt(1), dto);
  });

  it('remove should delegate to service', async () => {
    service.remove.mockResolvedValue({ success: true });
    const res = await controller.remove('1');
    expect(res).toEqual({ success: true });
    expect(service.remove).toHaveBeenCalledWith(BigInt(1));
  });
});
