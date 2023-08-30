import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ReservationsModule } from './reservations.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { PrismaClientExceptionFilter } from '@app/common/prisma-db/prisma.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ReservationsModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.listen(configService.get('PORT'));
}
bootstrap();
