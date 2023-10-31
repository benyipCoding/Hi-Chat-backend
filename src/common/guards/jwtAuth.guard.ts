import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    // console.log(1);
    await super.canActivate(context);
    // console.log(4);
    const request: Request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }

  handleRequest(
    err: any,
    user: any,
    // info: any,
    // context: ExecutionContext,
    // status?: any,
  ) {
    // console.log(3);

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
