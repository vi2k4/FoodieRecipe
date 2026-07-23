import { ReportStatus } from '../../../generated/prisma/client';

export class UpdateReportDto {
  status!: ReportStatus;
}
