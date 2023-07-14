import { PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationsService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
