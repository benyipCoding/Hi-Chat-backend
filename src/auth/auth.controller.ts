import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  // UseGuards,
  // Req,
  // Get,
  // UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
// import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
// import { Request } from 'express';
// import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';

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
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SignIn' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
