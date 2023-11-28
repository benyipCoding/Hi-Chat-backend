import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Header,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { Subject } from 'rxjs';

@ApiTags('Authentication Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SignIn' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout' })
  logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  // #region just for test
  @Get('connect-sse')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  async connectSSE(@Req() req: Request, @Res() res: Response) {
    const client = new Subject<string>();

    const msg = new Array(70000).fill({ name: 'jack', age: 20 });
    let count = 0;
    const timeId = setInterval(() => {
      client.next(msg[count]);
      count++;
      if (count === msg.length - 1) {
        clearInterval(timeId);
        res.end();
      }
    }, 100);

    res.flushHeaders();

    client.subscribe((message) => {
      res.write(`data: ${message}\n\n`);
    });
  }

  @Get('connect-normal')
  // @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  async connectNormal() {
    const msg = new Array(70000);

    return msg;
  }
  //#endregion
}
