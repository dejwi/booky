import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule, NOTIFICATIONS_SERVICE } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        KAFKA_BROKERS: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        KAFKA_API_KEY: Joi.string(),
        KAFKA_API_SECRET: Joi.string(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_SERVICE,
        useFactory: async (configService: ConfigService) => ({
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
              groupId: 'notifications-consumer',
              allowAutoTopicCreation: true,
            },
          },
          transport: Transport.KAFKA,
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
