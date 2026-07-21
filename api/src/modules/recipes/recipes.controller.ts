import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('maxCalories') maxCalories?: string,
    @Query('maxCookTime') maxCookTime?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.recipesService.findAll({
      search,
      category,
      maxCalories: maxCalories ? parseFloat(maxCalories) : undefined,
      maxCookTime: maxCookTime ? parseInt(maxCookTime, 10) : undefined,
      difficulty,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(BigInt(id));
  }
}
