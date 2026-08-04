import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('recipes/:recipeId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thêm bình luận mới hoặc phản hồi vào công thức' })
  @ApiParam({ name: 'recipeId', description: 'ID của công thức', type: String })
  @ApiQuery({
    name: 'parentCommentId',
    description: 'ID của bình luận cha nếu là phản hồi (reply)',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 201, description: 'Bình luận được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức hoặc bình luận cha' })
  async createComment(
    @Param('recipeId') recipeId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: any,
    @Query('parentCommentId') parentCommentId?: string,
  ) {
    const parentId = parentCommentId ? BigInt(parentCommentId) : undefined;
    return this.commentsService.createComment(
      BigInt(user.id),
      BigInt(recipeId),
      createCommentDto,
      parentId,
    );
  }

  @Get('recipes/:recipeId/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy cây bình luận của một công thức (có phân trang)' })
  @ApiParam({ name: 'recipeId', description: 'ID của công thức', type: String })
  @ApiQuery({ name: 'page', description: 'Trang hiện tại (mặc định 1)', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Số bình luận cha trên 1 trang (mặc định 10)', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trả về danh sách cây bình luận kèm thông tin phân trang' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async getComments(
    @Param('recipeId') recipeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(limit, 10)) : 10;
    return this.commentsService.getCommentsTree(BigInt(recipeId), pageNum, limitNum);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chỉnh sửa bình luận của bản thân' })
  @ApiParam({ name: 'id', description: 'ID của bình luận', type: String })
  @ApiResponse({ status: 200, description: 'Bình luận được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa bình luận này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.updateComment(BigInt(user.id), BigInt(id), updateCommentDto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa bình luận của bản thân' })
  @ApiParam({ name: 'id', description: 'ID của bình luận', type: String })
  @ApiResponse({ status: 200, description: 'Bình luận được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa bình luận này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.deleteComment(BigInt(user.id), BigInt(id));
  }
}
