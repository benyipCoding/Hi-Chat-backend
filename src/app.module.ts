import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TempModule } from './temp/temp.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  imports: [
    TempModule,
    // TypeOrmModule.forRoot({
    //   type: 'mysql', //数据库类型
    //   username: 'root', //账号
    //   password: '123456', //密码
    //   host: 'localhost', //host
    //   port: 3306, //端口
    //   database: 'portal', //库名
    //   //entities: [__dirname + '/**/*.entity{.ts,.js}'], //实体文件
    //   synchronize: true, //synchronize字段代表是否自动将实体类同步到数据库
    //   retryDelay: 500, //重试连接数据库间隔
    //   retryAttempts: 10, //重试连接数据库的次数
    //   autoLoadEntities: true, //如果为true,将自动加载实体 forFeature()方法注册的每个实体都将自动添加到配置对象的实体数组中
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
