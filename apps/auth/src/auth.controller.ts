import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LocalAuthGuard } from './guards/local.guard';
import { CurrentUser, UserWithRoles } from '@app/common';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = await this.authService.register(
      createUserDto,
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@CurrentUser() user: UserWithRoles) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = user;
    return data;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserWithRoles,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwt = await this.authService.login(user.id, res);
    res.json({ token: jwt });
  }

  @UseGuards(JwtAuthGuard)
  @Get('add-admin')
  async admin(@CurrentUser() user: UserWithRoles) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = await this.authService.addAmin(user.id);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
}
