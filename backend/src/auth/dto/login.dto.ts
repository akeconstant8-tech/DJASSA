import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'amara.toure@djassa.ci', description: 'Email ou numéro de téléphone' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  password: string;
}
