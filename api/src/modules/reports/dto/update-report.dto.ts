import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '../../../generated/prisma/client';

export class UpdateReportDto {
  @IsNotEmpty({ message: 'Trạng thái báo cáo không được để trống' })
  @IsEnum(ReportStatus, { message: 'Trạng thái báo cáo không hợp lệ' })
  status!: ReportStatus;
}
