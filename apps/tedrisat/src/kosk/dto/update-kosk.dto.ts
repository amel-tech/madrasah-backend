import { PartialType } from '@nestjs/swagger';
import { CreateKoskDto } from './create-kosk.dto';

export class UpdateKoskDto extends PartialType(CreateKoskDto) {}
