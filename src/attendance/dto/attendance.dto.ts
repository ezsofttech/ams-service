import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PunchInDto {
  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  location_id: string;

  @ApiProperty({ example: 21.251 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 81.629 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 'Samsung Galaxy S24' })
  @IsOptional()
  device_info?: string;
}

export class PunchOutDto {
  @ApiProperty({ example: 21.251 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 81.629 })
  @IsNumber()
  longitude: number;
}
