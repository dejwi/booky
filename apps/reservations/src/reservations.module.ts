import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import {
  AUTH_SERVICE,
  HealthModule,
  LoggerModule,
  PAYMENTS_SERVICE,
} from '@app/common';
import { PrismaModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        KAFKA_BROKERS: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        KAFKA_API_KEY: Joi.string(),
        KAFKA_API_SECRET: Joi.string(),
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
