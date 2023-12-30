import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { TransactionModule } from './transaction/transaction.module';
import { WebsocketModule } from './websocket/websocket.module';
import { FriendsModule } from './friends/friends.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsModule } from './event/events.module';
import { MessageModule } from './message/message.module';
import { UploadModule } from './upload/upload.module';
import { GroupConversationModule } from './group-conversation/group-conversation.module';

const envFilePath = `.env.stage.${process.env.STAGE}`;
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isDev = configService.get('STAGE') === 'dev';

        return {
          type: 'mysql',
          username: configService.get('DB_USER_NAME'),
          password: configService.get('DB_PASSWORD'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDev,
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    UserModule,
    ConversationModule,
    TransactionModule,
    WebsocketModule,
    FriendsModule,
    EventEmitterModule.forRoot(),
    EventsModule,
    MessageModule,
    UploadModule,
    GroupConversationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
