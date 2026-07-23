import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ReportStatus } from '../../generated/prisma/client';
import type { User } from '../../generated/prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('recipes/:id/report')
  async createReport(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(BigInt(id), user.id, dto);
  }

  @Get('admin/reports')
  @Roles(UserRole.ADMIN)
  async findAll(@Query('status') status?: ReportStatus) {
    return this.reportsService.findAll(status);
  }

  @Patch('admin/reports/:id')
  @Roles(UserRole.ADMIN)
  async handleReport(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.handleReport(BigInt(id), user.id, dto);
  }
}
