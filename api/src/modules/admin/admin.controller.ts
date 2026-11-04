import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const stats = await this.dashboardService.getDashboardStats();
    const highlightedRecipes = await this.dashboardService.getHighlightedRecipes();
    const pendingReports = await this.dashboardService.getPendingReports();
    return {
      stats,
      highlightedRecipes,
      pendingReports,
    };
  }

  @Get('statistics')
  async getStatistics() {
    return this.dashboardService.getStatistics();
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getUsers(search, pageNum, limitNum);
  }

  @Patch('users/:id')
  async toggleUserLock(
    @Param('id') id: string,
    @Body('isLocked') isLocked: boolean,
  ) {
    return this.adminService.toggleUserLock(BigInt(id), isLocked);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @Req() request: { user: { id: bigint } },
  ) {
    return this.adminService.updateUserRole(BigInt(id), role, request.user.id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(BigInt(id));
  }

  @Get('recipes')
  async getRecipes(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getRecipes(search, pageNum, limitNum);
  }

  @Get('recipes/pending')
  async getPendingRecipes() {
    return this.adminService.getPendingRecipes();
  }

  @Patch('recipes/:id/review')
  async reviewRecipe(@Param('id') id: string, @Body('approved') approved: boolean) {
    return this.adminService.reviewRecipe(BigInt(id), approved);
  }

  @Patch('recipes/:id')
  async toggleRecipeVisibility(
    @Param('id') id: string,
    @Body('isPublic') isPublic: boolean,
  ) {
    return this.adminService.toggleRecipeVisibility(BigInt(id), isPublic);
  }

  @Delete('recipes/:id')
  async deleteRecipe(@Param('id') id: string) {
    return this.adminService.deleteRecipe(BigInt(id));
  }
}
