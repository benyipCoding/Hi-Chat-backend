import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { User } from 'src/db/entities/user.entity';
import { Tokens } from 'src/auth/interfaces';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    let hasTokens: boolean;
    if (request.user) {
      hasTokens =
        'accessToken' in request.user && 'refreshToken' in request.user;
    }

    return next.handle().pipe(
      map((data) => ({
        data: instanceToPlain(data),
        status: HttpStatus.OK,
        message: 'success',
        tokens: hasTokens
          ? {
              accessToken: (request.user as User & Tokens).accessToken,
              refreshToken: (request.user as User & Tokens).refreshToken,
            }
          : undefined,
      })),
    );
  }
}
