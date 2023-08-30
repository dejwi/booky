import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: configService.get<string>('KAFKA_BROKERS').split(','),
        sasl: {
          mechanism: 'plain',
          username: configService.get('KAFKA_API_KEY'),
          password: configService.get('KAFKA_API_SECRET'),
        },
      },
      consumer: {
        groupId: 'notifications-consumer',
        allowAutoTopicCreation: true,
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}
bootstrap();
