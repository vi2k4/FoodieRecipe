import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsIn, MaxLength } from 'class-validator';

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
  calories?: number;

  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'], { message: 'Độ khó không hợp lệ' })
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional()
  @IsNumber()
  servings?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
