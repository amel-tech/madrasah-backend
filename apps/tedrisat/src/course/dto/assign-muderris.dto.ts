import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body for `POST /courses/:id/muderris`. The `userId` field is what the
 * `RoleResolver` looks at to grant the MUDERRIS role for this course —
 * if it's omitted the entry exists only as a descriptive row and the
 * person cannot use their MUDERRIS scopes against the course.
 */
export class AssignMuderrisDto {
  @ApiPropertyOptional({
    description:
      'Keycloak `sub` of the user being assigned. Required for the authz layer to grant MUDERRIS on this course.',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'Müderris Ahmed Hilmi' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Sarf Müderrisi' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: 220, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  avatarHue?: number;
}
