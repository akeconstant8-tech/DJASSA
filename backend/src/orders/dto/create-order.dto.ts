import { IsString, IsArray, IsInt, IsPositive, ValidateNested, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty() @IsString() variantId: string;
  @ApiProperty() @IsInt() @IsPositive() quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Clé d\'idempotence — UUID généré côté client' })
  @IsString()
  idempotencyKey: string;

  @ApiProperty() @IsString() buyerName: string;
  @ApiProperty() @IsString() buyerPhone: string;
  @ApiProperty() @IsString() buyerCity: string;
  @ApiProperty() @IsString() @MinLength(5) buyerAddress: string;
  @ApiPropertyOptional() @IsOptional() @IsString() buyerNotes?: string;

  @ApiProperty({ enum: ['orange_money', 'mtn_momo', 'wave', 'card', 'cash_on_delivery'] })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
