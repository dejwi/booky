import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsCreateChargeDto } from './dto/payments-charge.dto';
import { ClientKafka } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE } from '@app/common';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientKafka,
  ) {}

  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    { apiVersion: '2022-11-15' },
  );

  async createCharge({ amount, email }: PaymentsCreateChargeDto) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method: 'pm_card_visa',
      amount: amount * 100,
      confirm: true,
      currency: 'usd',
      metadata: {
        email,
      },
    });

    this.notificationsClient.emit('notify_email', {
      email,
      text: `Successful reservation, your paymentID - ${paymentIntent.id}`,
    });

    return paymentIntent;
  }
}
