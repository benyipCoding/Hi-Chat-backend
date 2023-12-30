import {
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as COS from 'cos-nodejs-sdk-v5';
import { unlinkSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { User } from 'src/db/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Subject } from 'rxjs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// const COS = require('cos-js-sdk-v5');

@Injectable()
export class UploadService {
  private cos;
  constructor(private readonly userService: UserService) {
    this.cos = new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY,
    });
  }

  async uploadAvatar(request: Request, file: any, response: Response) {
    const lastUpdateTimeStamp = new Date(
      (request.user as User).updateAt,
    ).getTime();
    if (Date.now() - lastUpdateTimeStamp < 60000) {
      throw new GatewayTimeoutException(
        'The request is too frequent. Please try again later',
      );
    }

    const client = new Subject();
    client.subscribe((data: string) => {
      response.send({
        data: data,
        status: HttpStatus.OK,
        message: 'success',
      });
    });

    const distFile = readFileSync(
      join(__dirname, `../images/${file.filename}`),
    );

    const key = `${(request.user as User).name}-avatar-${file.filename}`;
    let url: string = '';
    this.cos.putObject(
      {
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: key,
        Body: distFile,
      },
      (err, data) => {
        if (!err) {
          // delete object in COS
          if ((request.user as User).avatarKey) {
            this.cos.deleteObject(
              {
                Bucket: process.env.COS_BUCKET,
                Region: process.env.COS_REGION,
                Key: (request.user as User).avatarKey,
              },
              (err, data) => {
                console.log(err || data);
              },
            );
          }

          // update user db
          url = `https://${data.Location}`;
          unlinkSync(join(__dirname, `../images/${file.filename}`));
          this.userService.updateAvatarByUserId(
            (request.user as User).id,
            url,
            key,
          );
          client.next(url);
        } else {
          unlinkSync(join(__dirname, `../images/${file.filename}`));
          throw new HttpException(
            `${JSON.stringify(err.data)}`,
            HttpStatus.CONFLICT,
          );
        }
      },
    );
  }
}
