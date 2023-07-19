import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@app/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const exists = await this.prismaService.user.findFirst({
      where: { email: createUserDto.email },
    });
    if (exists) {
      throw new UnprocessableEntityException(
        'Account with that email already exists',
      );
    }

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await bcrypt.hash(createUserDto.password, 10),
      },
    });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) throw new NotFoundException("User doesn't exist");

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async getUser(id: string) {
    return this.prismaService.user.findUniqueOrThrow({ where: { id } });
  }
}
