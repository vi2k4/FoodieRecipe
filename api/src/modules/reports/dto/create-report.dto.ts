import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty({ message: 'Lý do báo cáo không được để trống' })
  @IsString({ message: 'Lý do báo cáo phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Lý do báo cáo không được vượt quá 100 ký tự' })
  reason!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả chi tiết phải là chuỗi ký tự' })
  description?: string;
}
