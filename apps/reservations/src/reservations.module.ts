import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { AUTH_SERVICE, LoggerModule, PAYMENTS_SERVICE } from '@app/common';
import { PrismaModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        KAFKA_BROKERS: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        KAFKA_API_KEY: Joi.string().required(),
        KAFKA_API_SECRET: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
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
              groupId: 'auth-consumer',
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PAYMENTS_SERVICE,
        useFactory: (configService: ConfigService) => ({
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
              groupId: 'payments-consumer',
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
