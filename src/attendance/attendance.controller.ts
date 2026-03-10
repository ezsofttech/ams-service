import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service.js';
import { PunchInDto, PunchOutDto } from './dto/attendance.dto.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';

interface AuthRequest extends Request {
  user: { id: string; employee_id: string; role: string; name: string };
}

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('punch-in')
  @ApiOperation({ summary: 'Punch in for the day' })
  punchIn(@Req() req: AuthRequest, @Body() dto: PunchInDto) {
    return this.attendanceService.punchIn(req.user.id, dto);
  }

  @Post('punch-out')
  @ApiOperation({ summary: 'Punch out for the day' })
  punchOut(@Req() req: AuthRequest, @Body() dto: PunchOutDto) {
    return this.attendanceService.punchOut(req.user.id, dto);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's attendance status" })
  getTodayStatus(@Req() req: AuthRequest) {
    return this.attendanceService.getTodayStatus(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get own attendance history' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  getHistory(
    @Req() req: AuthRequest,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.attendanceService.getHistory(req.user.id, startDate, endDate);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all attendance records (Admin)' })
  @ApiQuery({ name: 'date', required: false })
  getAllAttendance(@Query('date') date?: string) {
    return this.attendanceService.getAllAttendance(date);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get attendance detail by ID (Admin)' })
  getAttendanceDetail(@Param('id') id: string) {
    return this.attendanceService.getAttendanceDetail(id);
  }
}
