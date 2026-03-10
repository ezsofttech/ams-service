import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';

interface AuthRequest extends Request {
  user: { id: string; employee_id: string; role: string; name: string };
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('employee')
  @ApiOperation({ summary: 'Get employee dashboard' })
  getEmployeeDashboard(@Req() req: AuthRequest) {
    return this.dashboardService.getEmployeeDashboard(req.user.id);
  }
}
