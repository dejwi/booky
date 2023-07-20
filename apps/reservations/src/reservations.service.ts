import { PAYMENTS_SERVICE, PrismaService, UserWithRoles } from '@app/common';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsClient: ClientKafka,
  ) {}

  findOne(id: string) {
    return this.prismaService.reservation.findFirstOrThrow({
      where: { id },
      include: { User: { select: { id: true, email: true } } },
    });
  }

  findAll() {
    this.prismaService.reservation.findMany({
      include: { User: { select: { id: true, email: true } } },
    });
  }

  async create(
    { endDate, startDate, charge }: CreateReservationDto,
    user: UserWithRoles,
  ) {
    if (new Date(startDate) > new Date(endDate))
      throw new BadRequestException("Start date shouldn't be after end date");

    return this.paymentsClient
      .send('create_charge', {
        ...charge,
        email: user.email,
      })
      .pipe(
        map((res) =>
          this.prismaService.reservation.create({
            data: {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              userId: user.id,
              invoiceId: res.id,
            },
          }),
        ),
      );
  }

  async update(id: string, { endDate, startDate }: UpdateReservationDto) {
    if (endDate && startDate) {
      if (new Date(startDate) > new Date(endDate))
        throw new BadRequestException("Start date shouldn't be after end date");
    } else if (startDate || endDate) {
      const res = await this.prismaService.reservation.findUnique({
        where: { id },
      });
      const sd = startDate || res.startDate;
      const ed = endDate || res.endDate;
      if (new Date(sd) > new Date(ed))
        throw new BadRequestException("Start date shouldn't be after end date");
    }

    return await this.prismaService.reservation.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.reservation.delete({ where: { id } });
  }
}
