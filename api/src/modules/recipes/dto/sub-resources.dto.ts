import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateIngredientDto {
  @IsNotEmpty({ message: 'Tên nguyên liệu không được để trống' })
  @IsString({ message: 'Tên nguyên liệu phải là chuỗi ký tự' })
  ingredientName!: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  quantity?: number;

  @IsOptional()
  @IsString({ message: 'Đơn vị phải là chuỗi ký tự' })
  unit?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị phải là số' })
  displayOrder?: number;
}

export class UpdateIngredientDto {
  @IsOptional()
  @IsString({ message: 'Tên nguyên liệu phải là chuỗi ký tự' })
  ingredientName?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  quantity?: number;

  @IsOptional()
  @IsString({ message: 'Đơn vị phải là chuỗi ký tự' })
  unit?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị phải là số' })
  displayOrder?: number;
}

export class CreateStepDto {
  @IsNotEmpty({ message: 'Số thứ tự bước không được để trống' })
  @IsNumber({}, { message: 'Số thứ tự bước phải là số' })
  stepNumber!: number;

  @IsNotEmpty({ message: 'Nội dung bước không được để trống' })
  @IsString({ message: 'Nội dung bước phải là chuỗi ký tự' })
  content!: string;
}

export class UpdateStepDto {
  @IsOptional()
  @IsNumber({}, { message: 'Số thứ tự bước phải là số' })
  stepNumber?: number;

  @IsOptional()
  @IsString({ message: 'Nội dung bước phải là chuỗi ký tự' })
  content?: string;
}

export class CreateImageDto {
  @IsNotEmpty({ message: 'Đường dẫn ảnh không được để trống' })
  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
  imageUrl!: string;

  @IsOptional()
  @IsIn(['THUMBNAIL', 'INGREDIENT', 'STEP', 'RESULT', 'AI_GENERATED', 'OTHER'], { message: 'Loại ảnh không hợp lệ' })
  type?:
    | 'THUMBNAIL'
    | 'INGREDIENT'
    | 'STEP'
    | 'RESULT'
    | 'AI_GENERATED'
    | 'OTHER';

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị phải là số' })
  displayOrder?: number;
}
