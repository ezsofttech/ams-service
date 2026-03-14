import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email (admin) or Employee ID (guard)',
    example: 'admin@boss.com',
  })
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;
}

export class RegisterAdminDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'admin@boss.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  address?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Admin refresh token used to authorize password reset',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  refresh_token: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsNotEmpty()
  new_password: string;

  @ApiPropertyOptional({
    description: 'Employee document ID',
    example: '67d2cb8262dbe6de1af4e7ae',
  })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Employee ID assigned by the system',
    example: 'BOSS-EMP-0001',
  })
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({
    description: 'Employee email',
    example: 'employee@boss.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsNotEmpty()
  refresh_token: string;
}
