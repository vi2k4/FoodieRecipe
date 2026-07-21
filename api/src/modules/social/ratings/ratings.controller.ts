import { Controller, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { RatingDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Ratings')
@Controller('recipes/:id/rating')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Đánh giá công thức nấu ăn (hoặc cập nhật nếu đã đánh giá)' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đánh giá không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async rateRecipe(
    @Param('id') id: string,
    @Body() ratingDto: RatingDto,
    @CurrentUser() user: any,
  ) {
    return this.ratingsService.rateRecipe(BigInt(user.id), BigInt(id), ratingDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chỉnh sửa điểm đánh giá công thức nấu ăn' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đánh giá không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức hoặc chưa từng đánh giá' })
  async updateRating(
    @Param('id') id: string,
    @Body() ratingDto: RatingDto,
    @CurrentUser() user: any,
  ) {
    return this.ratingsService.updateRating(BigInt(user.id), BigInt(id), ratingDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa đánh giá của công thức nấu ăn' })
  @ApiParam({ name: 'id', description: 'ID của công thức', type: String })
  @ApiResponse({ status: 200, description: 'Xóa đánh giá thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức hoặc chưa từng đánh giá' })
  async deleteRating(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ratingsService.deleteRating(BigInt(user.id), BigInt(id));
  }
}
