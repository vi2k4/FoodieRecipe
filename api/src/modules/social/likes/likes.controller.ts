import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Likes')
@Controller('recipes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('my-likes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách ID các công thức người dùng đã thích' })
  @ApiResponse({ status: 200, description: 'Danh sách ID các công thức đã thích' })
  async getMyLikes(@CurrentUser() user: any) {
    return this.likesService.getUserLikes(BigInt(user.id));
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thích một công thức nấu ăn' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Thích công thức thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async likeRecipe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.likesService.likeRecipe(BigInt(user.id), BigInt(id));
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bỏ thích một công thức nấu ăn' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Bỏ thích công thức thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức hoặc chưa từng thích' })
  async unlikeRecipe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.likesService.unlikeRecipe(BigInt(user.id), BigInt(id));
  }
}
