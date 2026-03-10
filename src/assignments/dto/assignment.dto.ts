import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  location_id: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  assigned_date?: string;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ example: '665abc123def456789012346' })
  @IsOptional()
  location_id?: string;

}
