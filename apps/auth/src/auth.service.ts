import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenPayload } from './types';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
}
