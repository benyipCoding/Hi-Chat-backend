import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Upload module')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'upload avatar endpoint' })
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @Req() request: Request,
    @UploadedFile() file: any,
    @Res() response: Response,
  ) {
    return this.uploadService.uploadAvatar(request, file, response);
  }
}
