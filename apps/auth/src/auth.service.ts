import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';
import { TokenPayload } from './types';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@app/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async login(userId: string, res: Response) {
    const tokenPayload: TokenPayload = {
      userId,
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    res.cookie('Authorization', token, {
      httpOnly: true,
      expires,
    });

    return token;
  }

  async register(createUserDto: CreateUserDto) {
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
    return this.prismaService.user.findUniqueOrThrow({
      where: { id },
      include: { roles: true },
    });
  }

  async addAmin(userId: string) {
    let role = await this.prismaService.userRole.findFirst({
      where: { name: 'Admin' },
    });

    if (!role) {
      role = await this.prismaService.userRole.create({
        data: { name: 'Admin' },
      });
    }

    return await this.prismaService.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: role.id },
        },
      },
      include: { roles: true },
    });
  }
}
