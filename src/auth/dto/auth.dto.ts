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
  @ApiProperty({ example: 'oldPassword123' })
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsNotEmpty()
  new_password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsNotEmpty()
  refresh_token: string;
}
