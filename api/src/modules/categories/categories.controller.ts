import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(BigInt(id));
  }

  // TODO: Add JwtAuthGuard and RolesGuard(Admin) when AuthModule is ready
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // TODO: Add JwtAuthGuard and RolesGuard(Admin) when AuthModule is ready
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(BigInt(id), updateCategoryDto);
  }

  // TODO: Add JwtAuthGuard and RolesGuard(Admin) when AuthModule is ready
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(BigInt(id));
  }
}
