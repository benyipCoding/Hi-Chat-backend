import { PartialType } from '@nestjs/swagger';
import { CreateTempDto } from './create-temp.dto';

export class UpdateTempDto extends PartialType(CreateTempDto) {}
