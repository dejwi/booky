import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ClientKafka } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CurrentUser,
  JwtAuthGuard,
  PAYMENTS_SERVICE,
  UserWithRoles,
} from '@app/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Roles } from '@app/common/decorators/roles.decorator';

@Controller()
export class ReservationsController implements OnModuleInit {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientKafka,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsClient: ClientKafka,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('test')
  async test(@CurrentUser() user: UserWithRoles) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: UserWithRoles,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(createReservationDto, user);
  }
  @Patch(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }

  onModuleInit() {
    this.authClient.subscribeToResponseOf('authenticate');
    this.paymentsClient.subscribeToResponseOf('create_charge');
  }
}
