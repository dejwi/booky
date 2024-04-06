import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      producer: {
        allowAutoTopicCreation: true,
      },
      client: {
        brokers: configService.get<string>('KAFKA_BROKERS').split(','),
        sasl:
          configService.get('KAFKA_API_KEY') &&
          configService.get('KAFKA_API_SECRET')
            ? {
                mechanism: 'plain',
                username: configService.get('KAFKA_API_KEY'),
                password: configService.get('KAFKA_API_SECRET'),
              }
            : undefined,
      },
      consumer: {
        groupId: 'auth-consumer',
        allowAutoTopicCreation: true,
      },
    },
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
