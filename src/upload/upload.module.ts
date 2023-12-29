import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        filename: (_, file, callback) => {
          const filename = `${Date.now() + extname(file.originalname)}`;
          return callback(null, filename);
        },
        destination: join(__dirname, '../images'),
      }),
    }),
    UserModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
