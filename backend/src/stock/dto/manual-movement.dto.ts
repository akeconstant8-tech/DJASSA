import { IsString, IsInt, IsPositive, IsIn, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualMovementDto {
  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty()
  @IsString()
  locationId: string;

  @ApiProperty({ enum: ['ENTREE', 'SORTIE', 'AJUSTEMENT'] })
  @IsIn(['ENTREE', 'SORTIE', 'AJUSTEMENT'])
  type: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 'Réception fournisseur — bon n°1042' })
  @IsString()
  @MinLength(5, { message: 'Le motif doit faire au moins 5 caractères.' })
  reason: string;
}
