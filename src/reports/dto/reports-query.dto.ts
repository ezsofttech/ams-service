import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DailyReportQueryDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  location_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class WeeklyReportQueryDto {
  @ApiProperty({ description: 'Start date in YYYY-MM-DD format' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: 'End date in YYYY-MM-DD format' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional()
  @IsOptional()
  location_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class MonthlyReportQueryDto {
  @ApiProperty({ description: 'Year as number' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: 'Month as number (1-12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiPropertyOptional()
  @IsOptional()
  location_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
