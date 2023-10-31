import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TempService } from './temp.service';
import { CreateTempDto } from './dto/create-temp.dto';
import { UpdateTempDto } from './dto/update-temp.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('temp')
export class TempController {
  constructor(private readonly tempService: TempService) {}

  @Post()
  create(@Body() createTempDto: CreateTempDto) {
    return this.tempService.create(createTempDto);
  }

  @Get()
  findAll() {
    return this.tempService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tempService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTempDto: UpdateTempDto) {
    return this.tempService.update(+id, updateTempDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tempService.remove(+id);
  }
}
