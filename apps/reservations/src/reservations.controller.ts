import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ClientKafka } from '@nestjs/microservices';
import { AUTH_SERVICE, CurrentUser, JwtAuthGuard } from '@app/common';
import { User } from '@prisma/client';

@Controller()
export class ReservationsController implements OnModuleInit {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientKafka,
  ) {}

  @Get()
  getHello() {
    return this.reservationsService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  async test(@CurrentUser() user: User) {
    return user;
  }

  onModuleInit() {
    this.authClient.subscribeToResponseOf('authenticate');
  }
}
