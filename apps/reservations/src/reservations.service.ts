import { AUTH_SERVICE, PrismaService } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientKafka,
  ) {}

  getHello() {
    return 'hi';
  }
}
