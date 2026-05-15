import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RobotsTxtController } from './robots.txt/robots.txt.controller';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy/throttler-behind-proxy.guard';
import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    PostModule,
    PrismaModule,
  ],
  controllers: [
    AppController,
    RobotsTxtController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}