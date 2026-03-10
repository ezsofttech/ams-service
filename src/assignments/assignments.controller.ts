import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service.js';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new assignment (Admin)' })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all assignments (Admin)' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get('location/:locationId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get assignments by location (Admin)' })
  findByLocation(@Param('locationId') locationId: string) {
    return this.assignmentsService.findByLocation(locationId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get assignments by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.assignmentsService.findByEmployee(employeeId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update assignment (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete assignment (Admin)' })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
