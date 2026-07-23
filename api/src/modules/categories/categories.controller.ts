import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Post('admin/categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body('name') name: string,
    @Body('description') description?: string,
    @Body('icon') icon?: string,
  ) {
    return this.categoriesService.create(name, description, icon);
  }

  @Patch('admin/categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description?: string,
    @Body('icon') icon?: string,
  ) {
    return this.categoriesService.update(BigInt(id), name, description, icon);
  }

  @Delete('admin/categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(BigInt(id));
  }
}
