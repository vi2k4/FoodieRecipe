import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Follows')
@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('me/following')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách người dùng tôi đang theo dõi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách người đang theo dõi' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getMyFollowing(@CurrentUser() user: any) {
    return this.followsService.getFollowing(BigInt(user.id));
  }

  @Get('me/followers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách người dùng đang theo dõi tôi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách người theo dõi' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getMyFollowers(@CurrentUser() user: any) {
    return this.followsService.getFollowers(BigInt(user.id));
  }

  @Get(':id/following')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách người dùng một người đang theo dõi' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: String })
  @ApiResponse({ status: 200, description: 'Trả về danh sách người đang theo dõi' })
  async getFollowing(@Param('id') id: string) {
    return this.followsService.getFollowing(BigInt(id));
  }

  @Get(':id/followers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách người dùng đang theo dõi một người' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: String })
  @ApiResponse({ status: 200, description: 'Trả về danh sách người theo dõi' })
  async getFollowers(@Param('id') id: string) {
    return this.followsService.getFollowers(BigInt(id));
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Theo dõi một người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần theo dõi', type: String })
  @ApiResponse({ status: 200, description: 'Theo dõi thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ (ví dụ tự theo dõi bản thân)' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async followUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.followsService.followUser(BigInt(user.id), BigInt(id));
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hủy theo dõi một người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần hủy theo dõi', type: String })
  @ApiResponse({ status: 200, description: 'Hủy theo dõi thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng hoặc chưa từng theo dõi' })
  async unfollowUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.followsService.unfollowUser(BigInt(user.id), BigInt(id));
  }
}
