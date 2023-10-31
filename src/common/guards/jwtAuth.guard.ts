import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    // console.log(1);
    const res = (await super.canActivate(context)) as boolean;
    // console.log(4);
    // await super.logIn(request);
    return res;
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
