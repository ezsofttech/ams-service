import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';
import {
  DailyReportQueryDto,
  WeeklyReportQueryDto,
  MonthlyReportQueryDto,
} from './dto/reports-query.dto.js';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily attendance report (Admin)' })
  getDailyReport(@Query() query: DailyReportQueryDto) {
    const pagination = { page: query.page, limit: query.limit };
    return this.reportsService.getDailyReport(
      query.date,
      pagination,
      query.location_id,
      query.employee_id,
    );
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly attendance report (Admin)' })
  getWeeklyReport(@Query() query: WeeklyReportQueryDto) {
    const pagination = { page: query.page, limit: query.limit };
    return this.reportsService.getWeeklyReport(
      query.start_date,
      query.end_date,
      pagination,
      query.employee_id,
    );
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly attendance report (Admin)' })
  getMonthlyReport(@Query() query: MonthlyReportQueryDto) {
    const pagination = { page: query.page, limit: query.limit };
    return this.reportsService.getMonthlyReport(
      query.year,
      query.month,
      pagination,
      query.employee_id,
    );
  }
}
