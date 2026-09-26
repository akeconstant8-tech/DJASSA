import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional({ enum: ['DRAFT', 'ONLINE', 'ARCHIVED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'ONLINE', 'ARCHIVED'])
  status?: string;
}
