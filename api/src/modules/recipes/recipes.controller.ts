/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
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
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  private getUserId(
    user: any,
    headerUserId?: string,
    bodyUserId?: any,
  ): bigint {
    const raw = bodyUserId || headerUserId || user?.id || 1;
    return BigInt(raw);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryRecipeDto) {
    return this.recipesService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const recipeId = BigInt(id);
    await this.recipesService.incrementViewCount(recipeId);
    return this.recipesService.findOne(recipeId);
  }

  // TODO: Add JwtAuthGuard when AuthModule is ready
  @Post()
  create(
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() createRecipeDto: CreateRecipeDto,
  ) {
    const userId = this.getUserId(user, headerUserId, createRecipeDto.userId);
    return this.recipesService.create(userId, createRecipeDto);
  }

  // TODO: Add JwtAuthGuard when AuthModule is ready
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() updateRecipeDto: UpdateRecipeDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, updateRecipeDto.userId);
    return this.recipesService.update(BigInt(id), userId, updateRecipeDto);
  }

  // TODO: Add JwtAuthGuard when AuthModule is ready
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
  ) {
    const userId = this.getUserId(user, headerUserId);
    return this.recipesService.remove(BigInt(id), userId);
  }

  // --- Ingredients ---
  @Post(':id/ingredients')
  addIngredient(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() dto: CreateIngredientDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, dto?.userId);
    return this.recipesService.addIngredient(BigInt(id), userId, dto);
  }

  @Patch('/ingredients/:id')
  updateIngredient(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() dto: UpdateIngredientDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, dto?.userId);
    return this.recipesService.updateIngredient(BigInt(id), userId, dto);
  }

  @Delete('/ingredients/:id')
  removeIngredient(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
  ) {
    const userId = this.getUserId(user, headerUserId);
    return this.recipesService.removeIngredient(BigInt(id), userId);
  }

  // --- Steps ---
  @Post(':id/steps')
  addStep(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() dto: CreateStepDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, dto?.userId);
    return this.recipesService.addStep(BigInt(id), userId, dto);
  }

  @Patch('/steps/:id')
  updateStep(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() dto: UpdateStepDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, dto?.userId);
    return this.recipesService.updateStep(BigInt(id), userId, dto);
  }

  @Delete('/steps/:id')
  removeStep(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
  ) {
    const userId = this.getUserId(user, headerUserId);
    return this.recipesService.removeStep(BigInt(id), userId);
  }

  // --- Images ---
  @Post(':id/images')
  addImage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() dto: CreateImageDto & { userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, dto?.userId);
    return this.recipesService.addImage(BigInt(id), userId, dto);
  }

  @Delete('/images/:id')
  removeImage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
  ) {
    const userId = this.getUserId(user, headerUserId);
    return this.recipesService.removeImage(BigInt(id), userId);
  }

  // --- Tags ---
  @Post(':id/tags')
  addTagToRecipe(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
    @Body() body: { tagId: string; userId?: any },
  ) {
    const userId = this.getUserId(user, headerUserId, body?.userId);
    return this.recipesService.addTagToRecipe(
      BigInt(id),
      BigInt(body.tagId),
      userId,
    );
  }

  @Delete(':id/tags/:tagId')
  removeTagFromRecipe(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @CurrentUser() user: any,
    @Headers('x-user-id') headerUserId: string,
  ) {
    const userId = this.getUserId(user, headerUserId);
    return this.recipesService.removeTagFromRecipe(
      BigInt(id),
      BigInt(tagId),
      userId,
    );
  }
}
