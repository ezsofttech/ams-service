import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobLocationDto {
  @ApiProperty({ example: 'City Mall Gate 1' })
  @IsNotEmpty()
  location_name: string;

  @ApiProperty({ example: 'Sector 12 Main Road' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 21.251 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 81.629 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 200, description: 'Allowed punch radius in meters' })
  @IsNumber()
  radius?: number;

}

export class UpdateJobLocationDto {
  @ApiPropertyOptional({ example: 'City Mall Gate 2' })
  @IsOptional()
  location_name?: string;

  @ApiPropertyOptional({ example: 'Sector 15 Main Road' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 21.255 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 81.632 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  radius?: number;

}
