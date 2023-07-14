import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { LoggerModule } from '@app/common';
import { PrismaModule } from '@app/common';

@Module({
  imports: [LoggerModule, PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
