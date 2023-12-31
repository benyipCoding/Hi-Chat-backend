import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './utils/swagger';
import { GlobalFilter } from './common/exceptions/global.filter';
import { ValidationPipe } from '@nestjs/common';
import { GlobalInterceptor } from './common/interceptors/global.interceptor';
import * as passport from 'passport';
import { WebsocketAdapter } from './websocket/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.use(passport.initialize());
  app.useWebSocketAdapter(new WebsocketAdapter(app));

  setupSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
