import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service.js';
import {
  CreateJobLocationDto,
  UpdateJobLocationDto,
} from './dto/location.dto.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../entities/index.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new job location (Admin)' })
  create(@Body() dto: CreateJobLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all job locations' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.locationsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job location by ID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update job location (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateJobLocationDto) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete job location (Admin)' })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
