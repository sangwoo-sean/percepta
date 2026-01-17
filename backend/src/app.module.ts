import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonasModule } from './modules/personas/personas.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { UploadModule } from './modules/upload/upload.module';
import { AiModule } from './modules/ai/ai.module';
import { createLoggerConfig } from './config/logger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // dotenv-cli로 환경변수 로드
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const logLevel = configService.get<string>('LOG_LEVEL', isProduction ? 'info' : 'debug');
        const logDir = configService.get<string>('LOG_DIR', 'logs');

        return createLoggerConfig(logLevel, logDir, isProduction);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const useSSL = configService.get<string>('DATABASE_SSL') === 'true';

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USERNAME', 'percepta'),
          password: configService.get<string>('DATABASE_PASSWORD', 'percepta_password'),
          database: configService.get<string>('DATABASE_NAME', 'percepta'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: !isProduction,
          logging: false,
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PersonasModule,
    FeedbackModule,
    UploadModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
