import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsIn, MaxLength, Min } from 'class-validator';

export class CreateRecipeDto {
  @IsOptional()
  userId?: bigint | number | string;

  @IsNotEmpty({ message: 'Tiêu đề công thức không được để trống' })
  @IsString({ message: 'Tiêu đề công thức phải là chuỗi ký tự' })
  @MaxLength(150, { message: 'Tiêu đề không được vượt quá 150 ký tự' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  categoryId?: bigint | number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Số calo không được là số âm' })
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Thời gian nấu không được là số âm' })
  cookTime?: number;

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'], { message: 'Độ khó không hợp lệ' })
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Số khẩu phần phải lớn hơn hoặc bằng 1' })
  servings?: number;

  @IsNotEmpty({ message: 'Ảnh món ăn là bắt buộc' })
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
