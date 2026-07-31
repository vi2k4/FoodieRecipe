import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Icon phải là chuỗi ký tự' })
  icon?: string;
}
