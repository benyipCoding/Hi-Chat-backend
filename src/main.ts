import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './utils/swagger';
import { GlobalFilter } from './common/exceptions/global.filter';
import { ValidationPipe } from '@nestjs/common';
import { GlobalInterceptor } from './common/interceptors/global.interceptor';
import * as passport from 'passport';
import * as session from 'express-session';
import { getRepository } from 'typeorm';
import { Session } from './session/entities/session.entity';
import { TypeormStore } from 'connect-typeorm';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const sessionRepository = getRepository(Session);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      name: 'HI_CHAT_SESSION_ID',
      cookie: {
        maxAge: 86400000,
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  setupSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
