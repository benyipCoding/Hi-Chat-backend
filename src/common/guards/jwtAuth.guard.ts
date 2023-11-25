import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Tokens } from 'src/auth/interfaces';
import { User } from 'src/db/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    // console.log(1);
    await super.canActivate(context);
    // console.log(3);
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = (request.user as User & Tokens).accessToken;
    const refreshToken = (request.user as User & Tokens).refreshToken;
    if (accessToken && refreshToken) {
      const response: Response = context.switchToHttp().getResponse();
      response.setHeader(
        'tokens',
        JSON.stringify({ accessToken, refreshToken }),
      );
    }

    return request.isAuthenticated();
  }
}
