import { IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '../../entities/index.js';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'rahul@boss.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '456 Guard Lane' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  joining_date?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'rahul@boss.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '456 Guard Lane' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, example: 'inactive' })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
