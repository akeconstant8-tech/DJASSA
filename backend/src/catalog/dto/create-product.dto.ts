import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsInt() @IsPositive() price: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() originalPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) costPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) alertThreshold?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() imageUrls?: string[];
  @ApiPropertyOptional() @IsOptional() attributes?: Record<string, unknown>;
}

export class CreateProductDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
