import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Nội dung bình luận đã chỉnh sửa',
    example: 'Công thức này rất ngon, tôi đã làm thử và rất thích!',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString({ message: 'Nội dung bình luận phải là một chuỗi ký tự' })
  @MaxLength(1000, { message: 'Bình luận không được vượt quá 1000 ký tự' })
  content: string;
}
