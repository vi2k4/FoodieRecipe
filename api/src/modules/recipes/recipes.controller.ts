import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recipesService.findAll({
      search,
      categoryId,
      difficulty,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.recipesService.findById(BigInt(id));
  }
}
