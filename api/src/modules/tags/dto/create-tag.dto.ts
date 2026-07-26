import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'Tên thẻ không được để trống' })
  @IsString({ message: 'Tên thẻ phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Tên thẻ không được vượt quá 50 ký tự' })
  name!: string;
}
