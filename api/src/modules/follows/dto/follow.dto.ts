import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FollowDto {
  @ApiProperty({
    description: 'ID người dùng được theo dõi/bỏ theo dõi',
    example: '123',
  })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @IsString({ message: 'ID người dùng phải là dạng chuỗi' })
  followingId: string;
}
