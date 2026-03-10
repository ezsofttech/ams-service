import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily attendance report (Admin)' })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'location_id', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  getDailyReport(
    @Query('date') date: string,
    @Query('location_id') locationId?: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.reportsService.getDailyReport(date, locationId, employeeId);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly attendance report (Admin)' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'employee_id', required: false })
  getWeeklyReport(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.reportsService.getWeeklyReport(startDate, endDate, employeeId);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly attendance report (Admin)' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'employee_id', required: false })
  getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.reportsService.getMonthlyReport(
      parseInt(year),
      parseInt(month),
      employeeId,
    );
  }
}
