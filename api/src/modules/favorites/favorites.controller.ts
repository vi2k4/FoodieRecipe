import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('recipes/:id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thêm công thức vào mục yêu thích' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Thêm vào mục yêu thích thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async favoriteRecipe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.favoriteRecipe(BigInt(user.id), BigInt(id));
  }

  @Delete('recipes/:id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa công thức khỏi mục yêu thích' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Xóa khỏi mục yêu thích thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức hoặc chưa từng yêu thích' })
  async unfavoriteRecipe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.unfavoriteRecipe(BigInt(user.id), BigInt(id));
  }

  @Get('users/me/favorites')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách công thức yêu thích của tôi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách công thức yêu thích' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getMyFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(BigInt(user.id));
  }
}
