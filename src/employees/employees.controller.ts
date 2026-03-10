import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new employee (Admin)' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all employees (Admin)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.employeesService.findAll(search);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get employee by ID (Admin)' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update employee (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate employee (Admin)' })
  deactivate(@Param('id') id: string) {
    return this.employeesService.deactivate(id);
  }
}
