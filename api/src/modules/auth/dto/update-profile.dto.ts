import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Tên hiển thị phải là chuỗi' })
  @MaxLength(50, { message: 'Tên hiển thị không được vượt quá 50 ký tự' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Giới thiệu phải là chuỗi' })
  bio?: string | null;

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh đại diện phải là chuỗi' })
  avatarUrl?: string | null;
}
